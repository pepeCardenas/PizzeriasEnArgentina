import Link from 'next/link';
import { parseCitiesCSV, parseKeywordsCSV, getProvinces } from '../utils/csvParser';
import { generateHomeBreadcrumbs } from '../components/Breadcrumbs';
import Breadcrumbs from '../components/Breadcrumbs';
import SubmissionForm from '../components/SubmissionForm';

export default function Home() {
  // Get data from CSV files
  const cities = parseCitiesCSV();
  const keywords = parseKeywordsCSV();
  const provinces = getProvinces(cities);
  
  // Get top cities and provinces
  const topCities = cities.slice(0, 6);
  const topProvinces = provinces.slice(0, 4);
  const topKeywords = keywords.slice(0, 8);
  
  // Generate breadcrumbs
  const breadcrumbItems = generateHomeBreadcrumbs();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-red-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Encuentra las Mejores Pizzerías en Argentina
            </h1>
            <p className="text-xl mb-8">
              El directorio más completo de pizzerías en Argentina. Busca por ciudad y tipo de pizza.
            </p>
            <div className="flex justify-center">
              <Link
                href="/buscar"
                className="bg-yellow-500 text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors"
              >
                Buscar Pizzerías
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs items={breadcrumbItems} />
        
        {/* Popular Provinces Section */}
        <section className="mb-16 text-gray-900">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Provincias Populares
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topProvinces.map((province) => (
              <Link
                key={province.slug}
                href={`/provincia/${province.slug}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{province.name}</h3>
                <p className="text-gray-600 mb-4">
                  {province.cities.length} ciudades
                </p>
                <span className="text-red-700 font-medium">Ver pizzerías →</span>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Popular Cities Section */}
        <section className="mb-16 text-gray-900">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Ciudades Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCities.map((city) => (
              <Link
                key={city.slug}
                href={`/ciudad/${city.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{city.name}</h3>
                  <p className="text-gray-600 mb-4">
                    {city.province}
                  </p>
                  <span className="text-red-700 font-medium">Ver pizzerías →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Popular Pizza Types Section */}
        <section className="mb-16 text-gray-900">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Tipos de Pizza Populares
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topKeywords.map((keyword) => (
              <Link
                key={keyword.slug}
                href={`/pizzerias/${keyword.slug}/ciudad-de-buenos-aires`}
                className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold">{keyword.name}</h3>
              </Link>
            ))}
          </div>
        </section>
        
        {/* About Section */}
        <section className="mb-16 bg-white rounded-lg shadow-md p-8 text-gray-900">
          <h2 className="text-3xl font-bold mb-6">
            Sobre Pizzerías Argentina
          </h2>
          <div className="prose max-w-none">
            <p className="mb-4">
              Bienvenido al directorio más completo de pizzerías en Argentina. Nuestra misión es ayudarte a encontrar las mejores pizzerías en tu ciudad, según el tipo de pizza que estés buscando.
            </p>
            <p className="mb-4">
              Ya sea que estés buscando una deliciosa pizza a la piedra en Buenos Aires, una fugazzeta rellena en Córdoba o una napolitana en Rosario, nuestro directorio te ayudará a encontrar las mejores opciones.
            </p>
            <p>
              Navega por provincias, ciudades o tipos de pizza para descubrir nuevos lugares para disfrutar de la mejor pizza argentina.
            </p>
          </div>
        </section>
        
        {/* Contact Form Section */}
        <section className="mb-16 text-gray-900">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Contáctanos
          </h2>
          <div className="max-w-2xl mx-auto">
            <SubmissionForm cities={cities} />
          </div>
        </section>
      </div>
    </div>
  );
}
