'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { parseCitiesCSV, parseKeywordsCSV } from '../../../../../utils/csvParser';
import { generateKeywordCityBreadcrumbs } from '../../../../../components/Breadcrumbs';
import Breadcrumbs from '../../../../../components/Breadcrumbs';
import PizzeriasGrid from '../../../../../components/PizzeriasGrid';
import Pagination from '../../../../../components/Pagination';

// Client component
export default function KeywordCityPaginationClient({ params }: { params: { keyword: string; city: string; page: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any>({ pizzerias: [], totalResults: 0 });
  const [city, setCity] = useState<any>(null);
  const [keyword, setKeyword] = useState<any>(null);
  const [breadcrumbItems, setBreadcrumbItems] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Pagination page - Fetching data for params:', params);
        
        // Get cities and keywords
        const cities = parseCitiesCSV();
        const keywords = parseKeywordsCSV();
        
        console.log('Pagination page - Cities loaded:', cities.length);
        console.log('Pagination page - Keywords loaded:', keywords.length);
        
        // Find the city and keyword by slug
        const foundCity = cities.find(c => c.slug === params.city);
        const foundKeyword = keywords.find(k => k.slug === params.keyword);
        const page = parseInt(params.page);
        
        console.log('Pagination page - Found city:', foundCity);
        console.log('Pagination page - Found keyword:', foundKeyword);
        console.log('Pagination page - Page number:', page);
        
        if (!foundCity || !foundKeyword || isNaN(page) || page < 1) {
          console.error('Pagination page - City, keyword, or page not valid');
          notFound();
          return;
        }
        
        setCity(foundCity);
        setKeyword(foundKeyword);
        setPageNumber(page);
        
        // Search for pizzerias using the API route
        console.log('Pagination page - Fetching pizzerias from API...');
        
        // Instead of making sequential API calls to get pageTokens,
        // we'll pass the page number to the API and let the server handle pagination
        console.log(`Fetching data for page ${page} directly`);
        
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keyword: foundKeyword.name,
            city: foundCity.name,
            page
          }),
        });
        
        console.log('Pagination page - API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch pizzerias: ${response.status} ${response.statusText}`);
        }
        
        const results = await response.json();
        console.log('Pagination page - Search results:', results);
        
        // If no results and not page 1, return 404
        if (results.pizzerias.length === 0 && page > 1) {
          console.error('Pagination page - No results for page > 1');
          notFound();
          return;
        }
        
        setSearchResults(results);
        
        // Generate breadcrumbs
        const items = generateKeywordCityBreadcrumbs(foundKeyword, foundCity);
        setBreadcrumbItems(items);
        
        // Calculate total pages based on total results and results per page
        // If there's a nextPageToken, there's at least one more page
        const hasNextPage = !!results.nextPageToken;
        
        // Calculate total pages based on total results (20 per page)
        let totalPages = Math.ceil(results.totalResults / 20);
        
        // If we're on page 1 and there's a next page token, ensure at least 2 pages
        if (page === 1 && hasNextPage) {
          totalPages = Math.max(totalPages, 2);
        }
        
        // If we're on page > 1, ensure at least current page
        if (page > 1) {
          totalPages = Math.max(totalPages, page);
        }
        
        // If there's no next page and we're not on page 1, use current page
        if (!hasNextPage && page > 1) {
          totalPages = page;
        }
        
        // Maximum 3 pages (60 results total)
        totalPages = Math.min(totalPages, 3);
        
        console.log(`Setting total pages to ${totalPages} (current page: ${page}, hasNextPage: ${hasNextPage})`);
        setTotalPages(totalPages);
        
        // If page is greater than total pages, return 404
        if (page > totalPages) {
          console.error('Pagination page - Page number exceeds total pages');
          notFound();
          return;
        }
      } catch (error: any) {
        console.error('Pagination page - Error fetching data:', error);
        setError(error.message || 'Error fetching data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
        <p className="text-center mt-4 text-lg font-medium text-gray-700">Buscando pizzerías...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (!city || !keyword) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <p>No se encontraron datos para esta búsqueda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        Las Mejores Pizzerías de {keyword.name} en {city.name}, {city.province} - Página {pageNumber}
      </h1>
      
      {/* Results */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">
          Resultados {(pageNumber - 1) * 20 + 1}-{Math.min(pageNumber * 20, searchResults.totalResults)} de {searchResults.totalResults}
        </h2>
        
        {searchResults.pizzerias.length > 0 ? (
          <PizzeriasGrid 
            pizzerias={searchResults.pizzerias} 
            keyword={keyword.name} 
            city={city.name} 
          />
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <p>No se encontraron pizzerías para esta búsqueda.</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {searchResults.pizzerias.length > 0 && (
        <Pagination 
          currentPage={pageNumber} 
          totalPages={totalPages} 
          baseUrl={`/pizzerias/${keyword.slug}/${city.slug}`} 
        />
      )}
    </div>
  );
}
