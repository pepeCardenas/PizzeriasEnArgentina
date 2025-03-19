// Add a check to ensure this module is only used on the server side
if (typeof window !== 'undefined') {
  throw new Error(
    'This module should only be used on the server side. Please make sure you are not importing it in client components.'
  );
}

import axios from 'axios';
import { Pizzeria, SearchResult } from '../types';
import { getCachedData, setCachedData } from './mongodb';

// Mark this file as server-only
export const dynamic = 'force-dynamic';

// Get API key from environment variables
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY environment variable is not set. Please check your .env.local file.');
}

const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';

// Function to search for pizzerias
export async function searchPizzerias(
  keyword: string,
  city: string,
  page: number = 1,
  pageToken?: string,
  skipCache: boolean = false
): Promise<SearchResult> {
  // Create a cache key - use only keyword, city and pageToken (not page number)
  // This ensures that we're caching based on the actual data from Google Places API
  const cacheKey = `${keyword}_${city}_${pageToken || 'first_page'}`;
  
  // For debugging
  console.log(`Cache key: ${cacheKey}, skipCache: ${skipCache}`);
  
  // Check cache first, unless skipCache is true
  if (!skipCache) {
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${keyword} in ${city}`);
      return cachedData as SearchResult;
    }
  } else {
    console.log(`Skipping cache for ${keyword} in ${city}`);
  }
  
  // Construct the search query
  const searchQuery = `Pizzerias de ${keyword} en ${city}`;
  
  try {
    console.log(`Making API request to ${PLACES_API_URL} with pageToken: ${pageToken || 'none'}`);
    
    const response = await axios.post(
      PLACES_API_URL,
      {
        textQuery: searchQuery,
        languageCode: 'es',
        pageSize: 20, // Maximum allowed by the API
        pageToken: pageToken || undefined
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.types,places.internationalPhoneNumber,places.currentOpeningHours,places.googleMapsUri,places.websiteUri,nextPageToken',
        }
      }
    );
    
    // Log the raw response to check if nextPageToken is present
    console.log('Raw API response:', JSON.stringify({
      places: response.data.places ? response.data.places.length : 0,
      nextPageToken: response.data.nextPageToken,
      hasNextPage: !!response.data.nextPageToken
    }));
    
    // Transform the response
    const pizzerias: Pizzeria[] = response.data.places.map((place: any) => ({
      id: place.id,
      name: place.displayName?.text || 'Sin nombre',
      address: place.formattedAddress || 'Sin dirección',
      rating: place.rating,
      userRatingsTotal: place.userRatingCount,
      priceLevel: place.priceLevel,
      types: place.types,
      phoneNumber: place.internationalPhoneNumber,
      websiteUri: place.websiteUri,
      openingHours: place.currentOpeningHours ? {
        weekdayText: place.currentOpeningHours.weekdayText,
        openNow: place.currentOpeningHours.openNow
      } : undefined,
      googleMapsUrl: place.googleMapsUri
    }));
    
    // Calculate total results
    // For the first page, we can estimate based on the number of results and whether there's a next page
    // For subsequent pages, we need to add to the previous count
    let totalResults = pizzerias.length;
    
    // If this is page 1 and there's a next page, estimate total as at least 2 pages worth
    if (page === 1 && response.data.nextPageToken) {
      totalResults = Math.max(totalResults, 40); // At least 2 pages (20 results per page)
    }
    
    // If this is not page 1, we're showing results starting from (page-1)*20+1
    if (page > 1) {
      totalResults = (page - 1) * 20 + pizzerias.length;
    }
    
    // Maximum total results is 60 (3 pages of 20 results)
    totalResults = Math.min(totalResults, 60);
    
    const result: SearchResult = {
      pizzerias,
      totalResults,
      nextPageToken: response.data.nextPageToken || ""
    };
    
    console.log(`Page ${page} results: ${pizzerias.length} pizzerias, totalResults: ${totalResults}, hasNextPage: ${!!response.data.nextPageToken}`);
    
    // Cache the result
    await setCachedData(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error searching pizzerias:', error);
    return { pizzerias: [], totalResults: 0, nextPageToken: "" };
  }
}
