'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { parseCitiesCSV, parseKeywordsCSV } from '../../../../utils/csvParser';
import { generateMetaTitle, generateMetaDescription, generateStructuredData } from '../../../../utils/seo';
import { generateKeywordCityBreadcrumbs } from '../../../../components/Breadcrumbs';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import PizzeriasGrid from '../../../../components/PizzeriasGrid';
import Pagination from '../../../../components/Pagination';

// Client component
export default function KeywordCityClient({ params }: { params: { keyword: string; city: string; page?: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any>({ pizzerias: [], totalResults: 0 });
  const [city, setCity] = useState<any>(null);
  const [keyword, setKeyword] = useState<any>(null);
  const [breadcrumbItems, setBreadcrumbItems] = useState<any[]>([]);
  const [structuredData, setStructuredData] = useState<any>({});
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching data for params:', params);
        
        // Get cities and keywords
        const cities = parseCitiesCSV();
        const keywords = parseKeywordsCSV();
        
        console.log('Cities loaded:', cities.length);
        console.log('Keywords loaded:', keywords.length);
        
        // Find the city and keyword by slug
        const foundCity = cities.find(c => c.slug === params.city);
        const foundKeyword = keywords.find(k => k.slug === params.keyword);
        
        console.log('Found city:', foundCity);
        console.log('Found keyword:', foundKeyword);
        
        if (!foundCity || !foundKeyword) {
          console.error('City or keyword not found');
          notFound();
          return;
        }
        
        setCity(foundCity);
        setKeyword(foundKeyword);
        
        // Get page number
        const page = params.page ? parseInt(params.page) : 1;
        console.log('Page number:', page);
        
        // Search for pizzerias using the API route
        console.log('Fetching pizzerias from API...');
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
        
        console.log('API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch pizzerias: ${response.status} ${response.statusText}`);
        }
        
        const results = await response.json();
        console.log('Search results:', results);
        
        setSearchResults(results);
        
        // Generate breadcrumbs
        const items = generateKeywordCityBreadcrumbs(foundKeyword, foundCity);
        setBreadcrumbItems(items);
        
        // Calculate total pages
        const resultsPerPage = 15;
        const pages = Math.ceil(results.totalResults / resultsPerPage) || 1;
        setTotalPages(pages);
        
        // Generate structured data
        const data = generateStructuredData({ keyword: foundKeyword, city: foundCity, type: 'keyword-city' });
        setStructuredData(data);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Error fetching data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params]);
  
  // Get page number
  const page = params.page ? parseInt(params.page) : 1;
  
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
        Las Mejores Pizzerías de {keyword.name} en {city.name}, {city.province}
      </h1>
      
      {/* Page Description */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-lg mb-4">
          Descubre las mejores pizzerías de {keyword.name} en {city.name}. Hemos recopilado una lista de los mejores lugares para disfrutar de {keyword.name} en {city.name}, {city.province}.
        </p>
        <p>
          Estas pizzerías han sido seleccionadas por su calidad, servicio y popularidad. ¡Encuentra tu próximo lugar favorito para comer pizza!
        </p>
      </div>
      
      {/* Results */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">
          Top {searchResults.pizzerias.length} Pizzerías de {keyword.name} en {city.name}
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
          currentPage={page} 
          totalPages={totalPages} 
          baseUrl={`/pizzerias/${keyword.slug}/${city.slug}`} 
        />
      )}
      
      {/* Related Links */}
      <div className="mt-12 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Explora Más Opciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Otras ciudades con {keyword.name}</h3>
            <ul className="space-y-1">
              {parseCitiesCSV().slice(0, 5).map(relatedCity => (
                relatedCity.id !== city.id && (
                  <li key={relatedCity.id}>
                    <Link 
                      href={`/pizzerias/${keyword.slug}/${relatedCity.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      {keyword.name} en {relatedCity.name}
                    </Link>
                  </li>
                )
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Otros tipos de pizza en {city.name}</h3>
            <ul className="space-y-1">
              {parseKeywordsCSV().slice(0, 5).map(relatedKeyword => (
                relatedKeyword.id !== keyword.id && (
                  <li key={relatedKeyword.id}>
                    <Link 
                      href={`/pizzerias/${relatedKeyword.slug}/${city.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      {relatedKeyword.name} en {city.name}
                    </Link>
                  </li>
                )
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}
