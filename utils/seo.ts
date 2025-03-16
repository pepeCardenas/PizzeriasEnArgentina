import { City, Keyword } from '../types';

// Generate meta title for different page types
export function generateMetaTitle(params: {
  keyword?: Keyword;
  city?: City;
  province?: string;
  page?: number;
  type: 'home' | 'keyword-city' | 'city' | 'province';
}): string {
  const { keyword, city, province, page, type } = params;
  
  switch (type) {
    case 'home':
      return 'Directorio de Pizzerías en Argentina | Encuentra las Mejores Pizzerías';
    
    case 'keyword-city':
      if (!keyword || !city) return '';
      
      if (page && page > 1) {
        return `Top ${keyword.name} en ${city.name}, ${city.province} | Página ${page}`;
      }
      
      return `Las Mejores Pizzerías de ${keyword.name} en ${city.name}, ${city.province}`;
    
    case 'city':
      if (!city) return '';
      
      return `Pizzerías en ${city.name}, ${city.province} | Directorio Completo`;
    
    case 'province':
      if (!province) return '';
      
      return `Pizzerías en ${province} | Guía Completa de Pizzerías`;
    
    default:
      return 'Directorio de Pizzerías en Argentina';
  }
}

// Generate meta description for different page types
export function generateMetaDescription(params: {
  keyword?: Keyword;
  city?: City;
  province?: string;
  type: 'home' | 'keyword-city' | 'city' | 'province';
}): string {
  const { keyword, city, province, type } = params;
  
  switch (type) {
    case 'home':
      return 'Encuentra las mejores pizzerías en Argentina. Directorio completo con pizzerías por ciudad y tipo de pizza. Descubre dónde comer las mejores pizzas.';
    
    case 'keyword-city':
      if (!keyword || !city) return '';
      
      return `Descubre las mejores pizzerías de ${keyword.name} en ${city.name}, ${city.province}. Top 10 de lugares para disfrutar de ${keyword.name} en ${city.name}.`;
    
    case 'city':
      if (!city) return '';
      
      return `Guía completa de pizzerías en ${city.name}, ${city.province}. Encuentra los mejores lugares para comer pizza en ${city.name}.`;
    
    case 'province':
      if (!province) return '';
      
      return `Directorio de pizzerías en ${province}. Descubre las mejores pizzerías por ciudad en toda la provincia de ${province}.`;
    
    default:
      return 'Directorio de pizzerías en Argentina. Encuentra las mejores pizzerías por ciudad y tipo de pizza.';
  }
}

// Generate canonical URL
export function generateCanonicalUrl(params: {
  keyword?: Keyword;
  city?: City;
  province?: string;
  page?: number;
  type: 'home' | 'keyword-city' | 'city' | 'province';
}): string {
  const { keyword, city, province, page, type } = params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pizzerias-argentina.vercel.app';
  
  switch (type) {
    case 'home':
      return baseUrl;
    
    case 'keyword-city':
      if (!keyword || !city) return baseUrl;
      
      if (page && page > 1) {
        return `${baseUrl}/pizzerias/${keyword.slug}/${city.slug}/${page}`;
      }
      
      return `${baseUrl}/pizzerias/${keyword.slug}/${city.slug}`;
    
    case 'city':
      if (!city) return baseUrl;
      
      return `${baseUrl}/ciudad/${city.slug}`;
    
    case 'province':
      if (!province) return baseUrl;
      
      return `${baseUrl}/provincia/${province}`;
    
    default:
      return baseUrl;
  }
}

// Generate structured data (JSON-LD)
export function generateStructuredData(params: {
  keyword?: Keyword;
  city?: City;
  province?: string;
  type: 'home' | 'keyword-city' | 'city' | 'province';
}): Record<string, any> {
  const { keyword, city, province, type } = params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pizzerias-argentina.vercel.app';
  
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Directorio de Pizzerías en Argentina',
    url: baseUrl,
    description: 'Encuentra las mejores pizzerías en Argentina. Directorio completo con pizzerías por ciudad y tipo de pizza.',
  };
  
  switch (type) {
    case 'home':
      return baseStructuredData;
    
    case 'keyword-city':
      if (!keyword || !city) return baseStructuredData;
      
      return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Las Mejores Pizzerías de ${keyword.name} en ${city.name}, ${city.province}`,
        description: `Descubre las mejores pizzerías de ${keyword.name} en ${city.name}, ${city.province}.`,
        url: `${baseUrl}/pizzerias/${keyword.slug}/${city.slug}`,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Directorio de Pizzerías en Argentina',
          url: baseUrl
        }
      };
    
    case 'city':
      if (!city) return baseStructuredData;
      
      return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Pizzerías en ${city.name}, ${city.province}`,
        description: `Guía completa de pizzerías en ${city.name}, ${city.province}.`,
        url: `${baseUrl}/ciudad/${city.slug}`,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Directorio de Pizzerías en Argentina',
          url: baseUrl
        }
      };
    
    case 'province':
      if (!province) return baseStructuredData;
      
      return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Pizzerías en ${province}`,
        description: `Directorio de pizzerías en ${province}.`,
        url: `${baseUrl}/provincia/${province}`,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Directorio de Pizzerías en Argentina',
          url: baseUrl
        }
      };
    
    default:
      return baseStructuredData;
  }
}
