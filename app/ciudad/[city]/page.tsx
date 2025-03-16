import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { parseCitiesCSV, parseKeywordsCSV } from '../../../utils/csvParser';
import { generateMetaTitle, generateMetaDescription, generateStructuredData } from '../../../utils/seo';
import { generateCityBreadcrumbs } from '../../../components/Breadcrumbs';
import Breadcrumbs from '../../../components/Breadcrumbs';

// Generate static params for all cities
export async function generateStaticParams() {
  const cities = parseCitiesCSV();
  
  return cities.map(city => ({
    city: city.slug,
  }));
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const cities = parseCitiesCSV();
  const city = cities.find(c => c.slug === params.city);
  
  if (!city) {
    return {
      title: 'Página no encontrada',
      description: 'La página que estás buscando no existe.',
    };
  }
  
  return {
    title: generateMetaTitle({ city, type: 'city' }),
    description: generateMetaDescription({ city, type: 'city' }),
    alternates: {
      canonical: `/ciudad/${city.slug}`,
    },
  };
}

// Main page component
export default async function CityPage({ params }: { params: { city: string } }) {
  const cities = parseCitiesCSV();
  const keywords = parseKeywordsCSV();
  
  const city = cities.find(c => c.slug === params.city);
  
  if (!city) {
    notFound();
  }
  
  // Generate breadcrumbs
  const breadcrumbItems = generateCityBreadcrumbs(city);
  
  // Generate structured data
  const structuredData = generateStructuredData({ city, type: 'city' });

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        Pizzerías en {city.name}, {city.province}
      </h1>
      
      {/* Page Description */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-lg mb-4">
          Descubre las mejores pizzerías en {city.name}, {city.province}. Hemos recopilado una lista de los mejores lugares para disfrutar de pizza en {city.name}.
        </p>
        <p>
          Explora por tipo de pizza o navega por nuestra selección de las mejores pizzerías de la ciudad.
        </p>
      </div>
      
      {/* Pizza Types Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          Tipos de Pizza en {city.name}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {keywords.map(keyword => (
            <Link
              key={keyword.id}
              href={`/pizzerias/${keyword.slug}/${city.slug}`}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{keyword.name}</h3>
              <p className="text-gray-600 text-sm mb-2">
                Encuentra las mejores pizzerías de {keyword.name} en {city.name}
              </p>
              <span className="text-red-700 font-medium text-sm">Ver pizzerías →</span>
            </Link>
          ))}
        </div>
      </section>
      
      {/* About City Section */}
      <section className="mb-12 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          Sobre {city.name}
        </h2>
        <p className="mb-4">
          {city.name} es una ciudad ubicada en {city.province}, Argentina. Con una población de aproximadamente {city.population} habitantes, es un lugar con una rica tradición gastronómica, especialmente en lo que respecta a la pizza.
        </p>
        <p>
          La influencia italiana en la gastronomía argentina se refleja claramente en las pizzerías de {city.name}, donde podrás encontrar desde la clásica pizza a la piedra hasta especialidades como la fugazzeta rellena o la pizza de cancha.
        </p>
      </section>
      
      {/* Other Cities Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          Otras Ciudades en {city.province}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cities
            .filter(c => c.province === city.province && c.id !== city.id)
            .slice(0, 8)
            .map(relatedCity => (
              <Link
                key={relatedCity.id}
                href={`/ciudad/${relatedCity.slug}`}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold">{relatedCity.name}</h3>
              </Link>
            ))}
        </div>
      </section>
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}
