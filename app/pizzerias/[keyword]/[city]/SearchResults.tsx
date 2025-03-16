'use client';

import { useState, useEffect } from 'react';
import PizzeriasGrid from '../../../../components/PizzeriasGrid';
import Pagination from '../../../../components/Pagination';

export default function SearchResults({ keyword, city, page }: { keyword: any; city: any; page: number }) {
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any>({ pizzerias: [], totalResults: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Search for pizzerias using the API route
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keyword: keyword.name,
            city: city.name,
            page
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch pizzerias: ${response.status} ${response.statusText}`);
        }
        
        const results = await response.json();
        setSearchResults(results);
        
        // Calculate total pages
        const resultsPerPage = 10;
        const pages = Math.ceil(results.totalResults / resultsPerPage) || 1;
        setTotalPages(pages);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Error fetching data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [keyword, city, page]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        <p className="ml-4 text-lg font-medium text-gray-700">Buscando pizzerías...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <>
      {searchResults.pizzerias.length > 0 ? (
        <>
          <PizzeriasGrid 
            pizzerias={searchResults.pizzerias} 
            keyword={keyword.name} 
            city={city.name} 
          />
          
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            baseUrl={`/pizzerias/${keyword.slug}/${city.slug}`} 
          />
        </>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <p>No se encontraron pizzerías para esta búsqueda.</p>
        </div>
      )}
    </>
  );
}
