import { Suspense } from 'react';
import Link from 'next/link';
import { parseCitiesCSV, parseKeywordsCSV } from '../../../../utils/csvParser';
import { generateStructuredData } from '../../../../utils/seo';
import { generateKeywordCityBreadcrumbs } from '../../../../components/Breadcrumbs';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import dynamic from 'next/dynamic';

// Dynamically import the client component
const SearchResults = dynamic(() => import('./SearchResults'), { ssr: false });

// Generate static params for all keyword+city combinations
export async function generateStaticParams() {
  try {
    const cities = parseCitiesCSV();
    const keywords = parseKeywordsCSV();
    
    return keywords.flatMap(keyword => 
      cities.map(city => ({
        keyword: keyword.slug,
        city: city.slug
      }))
    );
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Server component
export default async function KeywordCityPage({ params }: { params: { keyword: string; city: string; page?: string } }) {
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
    
    if (!city || !keyword) {
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <p>No se encontraron datos para esta búsqueda.</p>
          </div>
        </div>
      );
    }
    
    // Get page number
    const page = params.page ? parseInt(params.page) : 1;
    
    // Generate breadcrumbs
    const breadcrumbItems = generateKeywordCityBreadcrumbs(keyword, city);
    
    // Generate structured data
    const structuredData = generateStructuredData({ keyword, city, type: 'keyword-city' });
    
    return (
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
          Las Mejores Pizzerías de {keyword.name} en {city.name}, {city.province}
        </h1>
        
        {/* Page Description */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
          <p className="text-lg mb-4 text-gray-700 leading-relaxed">
            Descubre las mejores pizzerías de {keyword.name} en {city.name}. Hemos recopilado una lista de los mejores lugares para disfrutar de {keyword.name} en {city.name}, {city.province}.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Estas pizzerías han sido seleccionadas por su calidad, servicio y popularidad. ¡Encuentra tu próximo lugar favorito para comer pizza!
          </p>
        </div>
        
        {/* Results */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Pizzerías de {keyword.name} en {city.name}
          </h2>
          
          <Suspense fallback={<LoadingFallback />}>
            <SearchResults keyword={keyword} city={city} page={page} />
          </Suspense>
        </div>
        
        {/* Related Links */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-900">Explora Más Opciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-800">Otras ciudades con {keyword.name}</h3>
              <ul className="space-y-2">
                {cities.slice(0, 5).map(relatedCity => (
                  relatedCity.id !== city.id && (
                    <li key={relatedCity.id} className="pl-2 border-l-2 border-red-200">
                      <Link 
                        href={`/pizzerias/${keyword.slug}/${relatedCity.slug}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {keyword.name} en {relatedCity.name}
                      </Link>
                    </li>
                  )
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-gray-800">Otros tipos de pizza en {city.name}</h3>
              <ul className="space-y-2">
                {keywords.slice(0, 5).map(relatedKeyword => (
                  relatedKeyword.id !== keyword.id && (
                    <li key={relatedKeyword.id} className="pl-2 border-l-2 border-red-200">
                      <Link 
                        href={`/pizzerias/${relatedKeyword.slug}/${city.slug}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
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
