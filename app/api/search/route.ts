import { NextRequest, NextResponse } from 'next/server';
import { searchPizzerias } from '../../../lib/googlePlaces';
import { 
  clearCacheForKeywordCity, 
  getCompleteSearchResults, 
  storeCompleteSearchResults 
} from '../../../lib/mongodb';
import { CompleteSearchResult, PageTokenMap, Pizzeria } from '../../../types';

export const dynamic = 'force-dynamic'; // Ensure this route is not statically optimized

// Set a timeout for the API route
export const maxDuration = 30; // 30 seconds maximum duration for Vercel

export async function POST(request: NextRequest) {
  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Search request timed out after 25 seconds'));
      }, 25000); // 25 seconds timeout
    });

    // Create the actual search function
    const searchPromise = async () => {
      const body = await request.json();
      const { keyword, city, page = 1 } = body;
      
      if (!keyword || !city) {
        return NextResponse.json(
          { error: 'Keyword and city are required' },
          { status: 400 }
        );
      }
      
      console.log(`Search request for ${keyword} in ${city}, page ${page}`);
      
      // Try to clear the cache for this keyword/city combination
      try {
        await clearCacheForKeywordCity(keyword, city);
      } catch (error) {
        console.error('Error clearing cache:', error);
        // Continue even if clearing cache fails
      }
      
      try {
        // Check if we already have complete search results for this keyword/city
        const completeResults = await getCompleteSearchResults(keyword, city);
        
        // If we have complete results, return the requested page
        if (completeResults) {
          console.log(`Using cached complete results for ${keyword} in ${city}`);
          
          // Check if the requested page exists
          if (page > completeResults.maxPages) {
            return NextResponse.json({
              pizzerias: [],
              totalResults: completeResults.totalResults,
              message: `Only ${completeResults.maxPages} pages available`
            });
          }
          
          // Calculate the slice of pizzerias for the requested page (20 results per page)
          const startIndex = (page - 1) * 20;
          const endIndex = startIndex + 20;
          const pizzeriasForPage = completeResults.pizzerias.slice(startIndex, endIndex);
          
          // Check if the next page token exists
          const hasNextPageToken = page < completeResults.maxPages && page in completeResults.pageTokens;
          
          return NextResponse.json({
            pizzerias: pizzeriasForPage,
            totalResults: completeResults.totalResults,
            nextPageToken: hasNextPageToken ? completeResults.pageTokens[page] : ""
          });
        }
      } catch (error) {
        console.error('Error retrieving cached results:', error);
        // Continue with fetching from Google Places API
      }
      
      // If we don't have complete results, fetch all pages (up to 3)
      console.log(`No cached complete results found for ${keyword} in ${city}, fetching all pages...`);
      
      // Fetch first page
      const firstPageResults = await searchPizzerias(keyword, city, 1, undefined, true);
      
      // Initialize complete results
      const allPizzerias: Pizzeria[] = [...firstPageResults.pizzerias];
      const pageTokens: PageTokenMap = {};
      let maxPages = 1;
      
      // Store the first page results
      if (firstPageResults.pizzerias.length > 0) {
        // If there's a next page token, store it and fetch more pages
        if (firstPageResults.nextPageToken) {
          pageTokens[1] = firstPageResults.nextPageToken;
          
          // Fetch up to 2 more pages (for a total of 3)
          let currentPage = 1;
          let currentToken = firstPageResults.nextPageToken;
          
          while (currentPage < 3 && currentToken) {
            console.log(`Fetching page ${currentPage + 1} with token: ${currentToken}`);
            
            try {
              const nextPageResults = await searchPizzerias(keyword, city, currentPage + 1, currentToken, true);
              
              // Add pizzerias to the complete results
              allPizzerias.push(...nextPageResults.pizzerias);
              
              // If there's a next page token, store it
              if (nextPageResults.nextPageToken) {
                pageTokens[currentPage + 1] = nextPageResults.nextPageToken;
                currentToken = nextPageResults.nextPageToken;
              } else {
                // No more pages
                currentToken = "";
              }
              
              // Increment page counter
              currentPage++;
              maxPages = currentPage;
            } catch (error) {
              console.error(`Error fetching page ${currentPage + 1}:`, error);
              break;
            }
          }
        } else {
          // If there's no next page token but we have results, we still have 1 page
          console.log('No next page token available, only one page of results exists');
          maxPages = 1;
        }
      } else {
        // No results at all
        console.log('No results found for this search');
        maxPages = 0;
      }
      
      // Calculate total results
      const totalResults = allPizzerias.length;
      
      // Store complete results in cache
      const completeSearchResults: CompleteSearchResult = {
        pizzerias: allPizzerias,
        totalResults,
        pageTokens,
        maxPages
      };
      
      try {
        await storeCompleteSearchResults(keyword, city, completeSearchResults);
      } catch (error) {
        console.error('Error storing complete search results:', error);
        // Continue even if storing fails
      }
      
      // Return the requested page
      const startIndex = (page - 1) * 20;
      const endIndex = startIndex + 20;
      const pizzeriasForPage = allPizzerias.slice(startIndex, endIndex);
      
      // Check if the page token exists
      const hasPageToken = page in pageTokens;
      
      return NextResponse.json({
        pizzerias: pizzeriasForPage,
        totalResults,
        nextPageToken: hasPageToken ? pageTokens[page] : ""
      });
    };

    // Race the search promise against the timeout
    return await Promise.race([searchPromise(), timeoutPromise]);
  } catch (error: any) {
    console.error('Error searching pizzerias:', error);
    
    // Check if it's a timeout error
    if (error.message && error.message.includes('timed out')) {
      return NextResponse.json(
        { error: 'Search request timed out. Please try again.' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error searching pizzerias: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
