import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { parseCitiesCSV, getProvinces, slugify } from '../../../utils/csvParser';
import { generateMetaTitle, generateMetaDescription, generateStructuredData } from '../../../utils/seo';
import { generateProvinceBreadcrumbs } from '../../../components/Breadcrumbs';
import Breadcrumbs from '../../../components/Breadcrumbs';

// Generate static params for all provinces
export async function generateStaticParams() {
  const cities = parseCitiesCSV();
  const provinces = getProvinces(cities);
  
  return provinces.map(province => ({
    province: province.slug,
  }));
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { province: string } }): Promise<Metadata> {
  const cities = parseCitiesCSV();
  const provinces = getProvinces(cities);
  
  const province = provinces.find(p => p.slug === params.province);
  
  if (!province) {
    return {
      title: 'Página no encontrada',
      description: 'La página que estás buscando no existe.',
    };
  }
  
  return {
    title: generateMetaTitle({ province: province.name, type: 'province' }),
    description: generateMetaDescription({ province: province.name, type: 'province' }),
    alternates: {
      canonical: `/provincia/${province.slug}`,
    },
  };
}

// Main page component
export default async function ProvincePage({ params }: { params: { province: string } }) {
  const cities = parseCitiesCSV();
  const provinces = getProvinces(cities);
  
  const province = provinces.find(p => p.slug === params.province);
  
  if (!province) {
    notFound();
  }
  
  // Generate breadcrumbs
  const breadcrumbItems = generateProvinceBreadcrumbs(province.name, province.slug);
  
  // Generate structured data
  const structuredData = generateStructuredData({ province: province.name, type: 'province' });

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
        Pizzerías en {province.name}
      </h1>
      
      {/* Page Description */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-gray-800">
        <p className="text-lg mb-4 ">
          Descubre las mejores pizzerías en {province.name}. Hemos recopilado una lista de ciudades donde podrás encontrar las mejores pizzerías de la provincia.
        </p>
        <p>
          Explora por ciudad para encontrar las mejores pizzerías en cada localidad de {province.name}.
        </p>
      </div>
      
      {/* Cities Section */}
      <section className="mb-12 text-gray-900" >
        <h2 className="text-2xl font-bold mb-6 ">
          Ciudades en {province.name}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {province.cities.map(city => (
            <Link
              key={city.id}
              href={`/ciudad/${city.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{city.name}</h3>
                {city.population && (
                  <p className="text-gray-600 mb-4">
                    Población: {city.population}
                  </p>
                )}
                <span className="text-red-700 font-medium">Ver pizzerías →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* About Province Section */}
      <section className="mb-12 bg-white rounded-lg shadow-md p-6 text-gray-900">
        <h2 className="text-2xl font-bold mb-4">
          Sobre {province.name}
        </h2>
        <p className="mb-4">
          {province.name} es una provincia de Argentina con una rica tradición gastronómica. La pizza, influenciada por la inmigración italiana, es uno de los platos más populares en la región.
        </p>
        <p>
          Con {province.cities.length} ciudades principales, {province.name} ofrece una gran variedad de pizzerías, cada una con su estilo único y especialidades locales.
        </p>
      </section>
      
      {/* Other Provinces Section */}
      <section className="mb-12 text-gray-900" >
        <h2 className="text-2xl font-bold mb-6">
          Otras Provincias
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {provinces
            .filter(p => p.name !== province.name)
            .slice(0, 8)
            .map(relatedProvince => (
              <Link
                key={relatedProvince.slug}
                href={`/provincia/${relatedProvince.slug}`}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold">{relatedProvince.name}</h3>
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
