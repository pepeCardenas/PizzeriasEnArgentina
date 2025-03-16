import { NextRequest, NextResponse } from 'next/server';
import { searchPizzerias } from '../../../lib/googlePlaces';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, city, page } = body;
    
    if (!keyword || !city) {
      return NextResponse.json(
        { error: 'Keyword and city are required' },
        { status: 400 }
      );
    }
    
    // For pages > 1, we need to get the pageToken from previous pages
    let pageToken: string | undefined = undefined;
    if (page > 1) {
      console.log(`Fetching page tokens for page ${page}`);
      
      // We need to get the pageToken for the requested page
      // This requires fetching page 1 first, then using its nextPageToken for page 2, and so on
      let currentPage = 1;
      let currentToken: string | undefined = undefined;
      
      while (currentPage < page) {
        console.log(`Getting token for page ${currentPage}`);
        const pageResults = await searchPizzerias(keyword, city, currentPage, currentToken);
        currentToken = pageResults.nextPageToken;
        
        if (!currentToken) {
          // If there's no next page token, we've reached the end
          console.log(`No more pages available after page ${currentPage}`);
          break;
        }
        
        currentPage++;
      }
      
      pageToken = currentToken;
    }
    
    console.log(`Fetching results for page ${page} with token: ${pageToken || 'none'}`);
    const results = await searchPizzerias(keyword, city, page, pageToken);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching pizzerias:', error);
    return NextResponse.json(
      { error: 'Error searching pizzerias' },
      { status: 500 }
    );
  }
}
