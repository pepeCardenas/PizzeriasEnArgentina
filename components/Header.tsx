'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { City, Keyword } from '../types';

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cities and keywords
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setError(null);
      
      try {
        const [citiesResponse, keywordsResponse] = await Promise.all([
          fetch('/api/cities'),
          fetch('/api/keywords')
        ]);
        
        if (!citiesResponse.ok || !keywordsResponse.ok) {
          throw new Error('Error fetching data');
        }
        
        const citiesData = await citiesResponse.json();
        const keywordsData = await keywordsResponse.json();
        
        setCities(citiesData);
        setKeywords(keywordsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error loading data');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle city selection change
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const citySlug = e.target.value;
    setSelectedCity(citySlug);
    
    // If both city and keyword are selected, enable auto-navigation
    if (citySlug && selectedKeyword) {
      navigateToSearch(citySlug, selectedKeyword);
    }
  };
  
  // Handle keyword selection change
  const handleKeywordChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const keywordSlug = e.target.value;
    setSelectedKeyword(keywordSlug);
    
    // If both city and keyword are selected, enable auto-navigation
    if (selectedCity && keywordSlug) {
      navigateToSearch(selectedCity, keywordSlug);
    }
  };
  
  // Navigate to search results
  const navigateToSearch = (citySlug: string, keywordSlug: string) => {
    setIsLoading(true);
    
    // Find the selected city and keyword objects
    const city = cities.find(c => c.slug === citySlug);
    const keyword = keywords.find(k => k.slug === keywordSlug);
    
    if (city && keyword) {
      router.push(`/pizzerias/${keyword.slug}/${city.slug}`);
    } else {
      setIsLoading(false);
    }
  };
  
  // Form submission handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCity || !selectedKeyword) {
      return;
    }
    
    navigateToSearch(selectedCity, selectedKeyword);
  };

  return (
    <header className="bg-[#F5A9A9] text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold flex items-center">
            <svg 
              className="w-8 h-8 mr-2" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" 
                fill="currentColor"
              />
              <path 
                d="M6.5 10L17.5 10" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <path 
                d="M6.5 14L17.5 14" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <path 
                d="M9 7L15 7" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <path 
                d="M9 17L15 17" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
            Pizzerías Argentina
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-[#F5F6CE] transition-colors">
              Inicio
            </Link>
            <Link href="/provincia/buenos-aires" className="hover:text-[#F5F6CE] transition-colors">
              Buenos Aires
            </Link>
            <Link href="/provincia/cordoba" className="hover:text-[#F5F6CE] transition-colors">
              Córdoba
            </Link>
            <Link href="/provincia/santa-fe" className="hover:text-[#F5F6CE] transition-colors">
              Santa Fe
            </Link>
            <Link href="/buscar" className="hover:text-[#F5F6CE] transition-colors">
              Buscar
            </Link>
          </div>
          
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="hover:text-[#F5F6CE] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                href="/provincia/buenos-aires" 
                className="hover:text-[#F5F6CE] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Buenos Aires
              </Link>
              <Link 
                href="/provincia/cordoba" 
                className="hover:text-[#F5F6CE] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Cordoba
              </Link>
              <Link 
                href="/provincia/santa-fe" 
                className="hover:text-[#F5F6CE] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Santa Fe
              </Link>
              <Link 
                href="/buscar" 
                className="hover:text-[#F5F6CE] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Buscar
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-[#E57373] py-4">
        <div className="container mx-auto px-4">
          {isLoadingData ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
              <span className="ml-3 text-white">Cargando...</span>
            </div>
          ) : error ? (
            <div className="text-center">
              <Link href="/buscar">
                <button className="px-6 py-2 bg-yellow-500 text-gray-900 font-medium rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300">
                  Ir a Búsqueda Avanzada
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <select
                  value={selectedKeyword}
                  onChange={handleKeywordChange}
                  className="w-full px-4 py-2 rounded-md text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  required
                  disabled={isLoading}
                  aria-label="Tipo de Pizza"
                >
                  <option value="">Tipo de Pizza</option>
                  {keywords.map((keyword) => (
                    <option key={keyword.id} value={keyword.slug}>
                      {keyword.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <select
                  value={selectedCity}
                  onChange={handleCityChange}
                  className="w-full px-4 py-2 rounded-md text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  required
                  disabled={isLoading}
                  aria-label="Ciudad"
                >
                  <option value="">Ciudad</option>
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
          )}
        </div>
      </div>
    </header>
  );
}
