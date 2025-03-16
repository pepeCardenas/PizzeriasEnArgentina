'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { City, Keyword } from '../types';

export default function SearchBar() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // In a real implementation, we would fetch this data from an API
    // For now, we'll use a simplified approach with hardcoded data
    const fetchData = async () => {
      try {
        // In production, this would be an API call
        const citiesResponse = await fetch('/api/cities');
        const keywordsResponse = await fetch('/api/keywords');
        
        const citiesData = await citiesResponse.json();
        const keywordsData = await keywordsResponse.json();
        
        setCities(citiesData);
        setKeywords(keywordsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty arrays
        setCities([]);
        setKeywords([]);
      }
    };
    
    fetchData();
    
    // Reset loading state when component mounts
    setIsLoading(false);
  }, []);

  // Reset loading state when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsLoading(false);
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCity || !selectedKeyword) {
      return;
    }
    
    setIsLoading(true);
    
    // Find the selected city and keyword objects
    const city = cities.find(c => c.slug === selectedCity);
    const keyword = keywords.find(k => k.slug === selectedKeyword);
    
    if (city && keyword) {
      // Store the current URL to detect navigation
      const currentUrl = window.location.href;
      
      // Navigate to the search results page
      router.push(`/pizzerias/${keyword.slug}/${city.slug}`);
      
      // Set a timeout to reset loading state if navigation doesn't happen
      setTimeout(() => {
        if (window.location.href === currentUrl) {
          setIsLoading(false);
        }
      }, 3000);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="keyword" className="block text-sm font-medium text-white mb-1">
            Tipo de Pizza
          </label>
          <select
            id="keyword"
            value={selectedKeyword}
            onChange={(e) => setSelectedKeyword(e.target.value)}
            className="w-full px-4 py-2 rounded-md text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            required
            disabled={isLoading}
          >
            <option value="">Selecciona un tipo</option>
            {keywords.map((keyword) => (
              <option key={keyword.id} value={keyword.slug}>
                {keyword.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <label htmlFor="city" className="block text-sm font-medium text-white mb-1">
            Ciudad
          </label>
          <select
            id="city"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-4 py-2 rounded-md text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            required
            disabled={isLoading}
          >
            <option value="">Selecciona una ciudad</option>
            {cities.map((city) => (
              <option key={city.id} value={city.slug}>
                {city.name}, {city.province}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isLoading || !selectedCity || !selectedKeyword}
            className="w-full md:w-auto px-6 py-2 bg-yellow-500 text-gray-900 font-medium rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>
      
      {isLoading && (
        <div className="flex justify-center items-center mt-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500"></div>
          <span className="ml-3 text-white">Buscando...</span>
        </div>
      )}
    </div>
  );
}
