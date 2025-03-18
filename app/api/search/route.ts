import { NextRequest, NextResponse } from 'next/server';
import { searchPizzerias } from '../../../lib/googlePlaces';
import { 
  clearCacheForKeywordCity, 
  getCompleteSearchResults, 
  storeCompleteSearchResults 
} from '../../../lib/mongodb';
import { CompleteSearchResult, PageTokenMap, Pizzeria } from '../../../types';

export const dynamic = 'force-dynamic'; // Ensure this route is not statically optimized

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, city, page = 1 } = body;
    
    if (!keyword || !city) {
      return NextResponse.json(
        { error: 'Keyword and city are required' },
        { status: 400 }
      );
    }
    
    console.log(`Search request for ${keyword} in ${city}, page ${page}`);
    
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
      
      // Calculate the slice of pizzerias for the requested page
      const startIndex = (page - 1) * 15;
      const endIndex = startIndex + 15;
      const pizzeriasForPage = completeResults.pizzerias.slice(startIndex, endIndex);
      
      // Return the results for the requested page
      return NextResponse.json({
        pizzerias: pizzeriasForPage,
        totalResults: completeResults.totalResults,
        nextPageToken: page < completeResults.maxPages ? completeResults.pageTokens[page] : undefined
      });
    }
    
    // If we don't have complete results, fetch all pages (up to 4)
    console.log(`No cached complete results found for ${keyword} in ${city}, fetching all pages...`);
    
    // Fetch first page
    const firstPageResults = await searchPizzerias(keyword, city, 1, undefined, true);
    
    // Initialize complete results
    const allPizzerias: Pizzeria[] = [...firstPageResults.pizzerias];
    const pageTokens: PageTokenMap = {};
    let maxPages = 1;
    
    // If there's a next page token, store it and fetch more pages
    if (firstPageResults.nextPageToken) {
      pageTokens[1] = firstPageResults.nextPageToken;
      
      // Fetch up to 3 more pages (for a total of 4)
      let currentPage = 1;
      let currentToken = firstPageResults.nextPageToken;
      
      while (currentPage < 4 && currentToken) {
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
            currentToken = undefined;
          }
          
          // Increment page counter
          currentPage++;
          maxPages = currentPage;
        } catch (error) {
          console.error(`Error fetching page ${currentPage + 1}:`, error);
          break;
        }
      }
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
    
    await storeCompleteSearchResults(keyword, city, completeSearchResults);
    
    // Return the requested page
    const startIndex = (page - 1) * 15;
    const endIndex = startIndex + 15;
    const pizzeriasForPage = allPizzerias.slice(startIndex, endIndex);
    
    return NextResponse.json({
      pizzerias: pizzeriasForPage,
      totalResults,
      nextPageToken: pageTokens[page] || undefined
    });
  } catch (error) {
    console.error('Error searching pizzerias:', error);
    return NextResponse.json(
      { error: 'Error searching pizzerias' },
      { status: 500 }
    );
  }
}
