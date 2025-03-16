import { Suspense } from 'react';
import { parseCitiesCSV, parseKeywordsCSV } from '../../../../../utils/csvParser';
import { generateKeywordCityBreadcrumbs } from '../../../../../components/Breadcrumbs';
import Breadcrumbs from '../../../../../components/Breadcrumbs';
import dynamic from 'next/dynamic';

// Dynamically import the client component
const SearchResults = dynamic(() => import('../SearchResults'), { ssr: false });

// Generate static params for all keyword+city+page combinations
export async function generateStaticParams() {
  try {
    const cities = parseCitiesCSV();
    const keywords = parseKeywordsCSV();
    
    // Generate params for pages 1-5 for each keyword+city combination
    return keywords.flatMap(keyword => 
      cities.flatMap(city => 
        Array.from({ length: 5 }, (_, i) => ({
          keyword: keyword.slug,
          city: city.slug,
          page: String(i + 1)
        }))
      )
    );
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Server component
export default async function KeywordCityPaginationPage({ params }: { params: { keyword: string; city: string; page: string } }) {
  // Loading fallback
  const LoadingFallback = () => (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
      <p className="text-center mt-4 text-lg font-medium text-gray-700">Cargando...</p>
    </div>
  );

  try {
    // Get cities and keywords
    const cities = parseCitiesCSV();
    const keywords = parseKeywordsCSV();
    
    // Find the city and keyword by slug
    const city = cities.find(c => c.slug === params.city);
    const keyword = keywords.find(k => k.slug === params.keyword);
    const page = parseInt(params.page);
    
    if (!city || !keyword || isNaN(page) || page < 1) {
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <p>No se encontraron datos para esta búsqueda.</p>
          </div>
        </div>
      );
    }
    
    // Generate breadcrumbs
    const breadcrumbItems = generateKeywordCityBreadcrumbs(keyword, city);
    
    return (
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
          Las Mejores Pizzerías de {keyword.name} en {city.name}, {city.province} - Página {page}
        </h1>
        
        {/* Results */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Pizzerías de {keyword.name} en {city.name} - Página {page}
          </h2>
          
          <Suspense fallback={<LoadingFallback />}>
            <SearchResults keyword={keyword} city={city} page={page} />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering page:', error);
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>Hubo un problema al cargar esta página. Por favor, inténtalo de nuevo más tarde.</p>
        </div>
      </div>
    );
  }
}
