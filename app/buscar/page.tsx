'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { City, Keyword } from '../../types';

export default function SearchPage() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
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
        setError('Hubo un problema al cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle search form submission
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
      router.push(`/pizzerias/${keyword.slug}/${city.slug}`);
    } else {
      setIsLoading(false);
    }
  };

  // Group cities by province
  const groupedCities = cities.reduce((acc, city) => {
    if (!acc[city.province]) {
      acc[city.province] = [];
    }
    acc[city.province].push(city);
    return acc;
  }, {} as Record<string, City[]>);

  return (
    <div className="container mx-auto px-4 py-12 text-gray-900">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        Buscar Pizzerías en Argentina
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-12">
        <h2 className="text-2xl font-bold mb-6">Encuentra las mejores pizzerías</h2>
        
        {isLoadingData ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <span className="ml-3 text-gray-700">Cargando datos...</span>
          </div>
        ) : (
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pizza
                </label>
                <select
                  id="keyword"
                  value={selectedKeyword}
                  onChange={(e) => setSelectedKeyword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
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
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <select
                  id="city"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                  disabled={isLoading}
                >
                  <option value="">Selecciona una ciudad</option>
                  {Object.entries(groupedCities).map(([province, provinceCities]) => (
                    <optgroup key={province} label={province}>
                      {provinceCities.map((city) => (
                        <option key={city.id} value={city.slug}>
                          {city.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading || !selectedCity || !selectedKeyword}
                className="bg-red-700 text-white font-medium py-2 px-6 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Buscando...' : 'Buscar Pizzerías'}
              </button>
            </div>
          </form>
        )}
        
        {isLoading && (
          <div className="flex justify-center items-center mt-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
            <span className="ml-3 text-gray-700">Buscando pizzerías...</span>
          </div>
        )}
      </div>
      
      {/* Popular Searches Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Búsquedas Populares
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            href="/pizzerias/pizza-a-la-piedra/ciudad-de-buenos-aires"
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">Pizza a la Piedra en Buenos Aires</h3>
            <p className="text-gray-600 text-sm">
              Descubre las mejores pizzerías de pizza a la piedra en la Ciudad de Buenos Aires.
            </p>
          </Link>
          
          <Link
            href="/pizzerias/fugazzeta/ciudad-de-buenos-aires"
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">Fugazzeta en Buenos Aires</h3>
            <p className="text-gray-600 text-sm">
              Encuentra las mejores pizzerías de fugazzeta en la Ciudad de Buenos Aires.
            </p>
          </Link>
          
          <Link
            href="/pizzerias/muzzarella/cordoba"
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">Muzzarella en Córdoba</h3>
            <p className="text-gray-600 text-sm">
              Descubre las mejores pizzerías de muzzarella en Córdoba.
            </p>
          </Link>
          
          <Link
            href="/pizzerias/napolitana/rosario"
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">Napolitana en Rosario</h3>
            <p className="text-gray-600 text-sm">
              Encuentra las mejores pizzerías de napolitana en Rosario.
            </p>
          </Link>
          
          <Link
            href="/pizzerias/calabresa/mar-del-plata"
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">Calabresa en Mar del Plata</h3>
            <p className="text-gray-600 text-sm">
              Descubre las mejores pizzerías de calabresa en Mar del Plata.
            </p>
          </Link>
          
          <Link
            href="/pizzerias/fugazzeta-rellena/ciudad-de-buenos-aires"
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">Fugazzeta Rellena en Buenos Aires</h3>
            <p className="text-gray-600 text-sm">
              Encuentra las mejores pizzerías de fugazzeta rellena en la Ciudad de Buenos Aires.
            </p>
          </Link>
        </div>
      </section>
      
      {/* Search Tips Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          Consejos para encontrar las mejores pizzerías
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Busca por tipo de pizza específico para encontrar las pizzerías especializadas.</li>
          <li>Explora diferentes ciudades para descubrir nuevas opciones.</li>
          <li>Consulta las reseñas y calificaciones para tomar una decisión informada.</li>
          <li>Considera la ubicación y accesibilidad al elegir una pizzería.</li>
          <li>Prueba diferentes estilos de pizza para ampliar tu experiencia gastronómica.</li>
        </ul>
      </section>
    </div>
  );
}
