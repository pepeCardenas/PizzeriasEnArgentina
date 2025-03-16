import { Pizzeria } from '../types';

interface PizzeriasGridProps {
  pizzerias: Pizzeria[];
  keyword: string;
  city: string;
}

export default function PizzeriasGrid({ pizzerias, keyword, city }: PizzeriasGridProps) {
  // Function to render stars based on rating
  const renderStars = (rating: number | undefined) => {
    if (!rating) return null;
    
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className="w-5 h-5 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ))}
        
        {halfStar && (
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        )}
        
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className="w-5 h-5 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ))}
        
        {rating && (
          <span className="ml-2 text-sm font-medium text-gray-900">
            ({rating.toFixed(1)})
          </span>
        )}
      </div>
    );
  };

  // Function to render price level
  const renderPriceLevel = (priceLevel: number | undefined) => {
    if (!priceLevel) return null;
    
    const priceLevels = ['$', '$$', '$$$', '$$$$'];
    return (
      <span className="text-gray-900 font-medium">
        {priceLevels[priceLevel - 1] || ''}
      </span>
    );
  };

  // Function to render opening hours
  const renderOpeningHours = (openingHours: Pizzeria['openingHours']) => {
    if (!openingHours) return null;
    
    return (
      <div className="mt-3">
        <div className="flex items-center mb-2">
          <svg 
            className="w-5 h-5 text-gray-900 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span className={`text-sm font-medium ${openingHours.openNow ? 'text-green-600' : 'text-red-600'}`}>
            {openingHours.openNow ? 'Abierto ahora' : 'Cerrado ahora'}
          </span>
        </div>
        
        {openingHours.weekdayText && openingHours.weekdayText.length > 0 && (
          <details className="text-sm text-gray-900">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 mb-1">
              Ver horarios
            </summary>
            <ul className="pl-2 mt-1 space-y-1 text-gray-900">
              {openingHours.weekdayText.map((day, index) => (
                <li key={index}>{day}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    );
  };

  // Function to render phone number
  const renderPhoneNumber = (phoneNumber: string | undefined) => {
    if (!phoneNumber) return null;
    
    return (
      <div className="flex items-center mt-3">
        <svg 
          className="w-5 h-5 text-gray-900 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
          />
        </svg>
        <a 
          href={`tel:${phoneNumber.replace(/\s/g, '')}`} 
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {phoneNumber}
        </a>
      </div>
    );
  };

  // Function to render website link
  const renderWebsite = (websiteUri: string | undefined) => {
    if (!websiteUri) return null;
    
    return (
      <div className="flex items-center mt-3">
        <svg 
          className="w-5 h-5 text-gray-900 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" 
          />
        </svg>
        <a 
          href={websiteUri} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Visitar sitio web
        </a>
      </div>
    );
  };

  if (pizzerias.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-xl font-semibold mb-4">No se encontraron resultados</h3>
        <p className="text-gray-900">
          No hemos encontrado pizzerías de {keyword} en {city}. Intenta con otra búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pizzerias.map((pizzeria) => (
        <div
          key={pizzeria.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="h-2 bg-red-500 rounded-t-lg"></div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-gray-900">{pizzeria.name}</h3>
            
            <div className="flex items-center justify-between mb-3">
              {renderStars(pizzeria.rating)}
              {renderPriceLevel(pizzeria.priceLevel)}
            </div>
            
            <div className="flex items-start mt-4">
              <svg 
                className="w-5 h-5 text-gray-900 mr-2 mt-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              <p className="text-gray-900 flex-1">
                {pizzeria.address}
              </p>
            </div>
            
            {pizzeria.googleMapsUrl && (
              <div className="mt-2 ml-7">
                <a 
                  href={pizzeria.googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
                >
                  Ver en Google Maps
                  <svg 
                    className="w-4 h-4 ml-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                    />
                  </svg>
                </a>
              </div>
            )}
            
            {renderPhoneNumber(pizzeria.phoneNumber)}
            {renderWebsite(pizzeria.websiteUri)}
            {renderOpeningHours(pizzeria.openingHours)}
            
            {pizzeria.userRatingsTotal && (
              <p className="text-sm text-gray-900 mt-4">
                Basado en {pizzeria.userRatingsTotal} reseñas
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4">
              {pizzeria.types?.slice(0, 5).map((type, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-gray-100 text-gray-900 rounded-md text-xs font-bold"
                >
                  {type.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
