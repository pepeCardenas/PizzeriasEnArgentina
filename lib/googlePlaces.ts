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
  pageToken?: string
): Promise<SearchResult> {
  // Create a cache key
  const cacheKey = `${keyword}_${city}_${page}_${pageToken || ''}`;
  
  // Check cache first
  const cachedData = await getCachedData(cacheKey);
  if (cachedData) {
    return cachedData as SearchResult;
  }
  
  // Construct the search query
  const searchQuery = `Pizzerias de ${keyword} en ${city}`;
  
  try {
    const response = await axios.post(
      PLACES_API_URL,
      {
        textQuery: searchQuery,
        languageCode: 'es',
        pageSize: 15,
        pageToken: pageToken || undefined
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.types,places.internationalPhoneNumber,places.currentOpeningHours,places.googleMapsUri,places.websiteUri',
        }
      }
    );
    
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
    
    const result: SearchResult = {
      pizzerias,
      totalResults: pizzerias.length,
      nextPageToken: response.data.nextPageToken
    };
    
    // Cache the result
    await setCachedData(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error searching pizzerias:', error);
    return { pizzerias: [], totalResults: 0 };
  }
}
