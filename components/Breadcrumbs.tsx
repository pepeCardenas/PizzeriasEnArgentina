import Link from 'next/link';
import { City, Keyword } from '../types';

interface BreadcrumbsProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="text-sm mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <ol className="flex flex-wrap items-center">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="mx-2 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            
            {item.href ? (
              <Link
                href={item.href}
                className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-800 font-semibold">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Helper functions to generate breadcrumbs for different page types
export function generateHomeBreadcrumbs() {
  return [
    { label: 'Inicio' }
  ];
}

export function generateProvinceBreadcrumbs(provinceName: string, provinceSlug: string) {
  return [
    { label: 'Inicio', href: '/' },
    { label: `Pizzerías en ${provinceName}` }
  ];
}

export function generateCityBreadcrumbs(city: City) {
  return [
    { label: 'Inicio', href: '/' },
    { label: `Pizzerías en ${city.province}`, href: `/provincia/${city.province.toLowerCase().replace(/\s+/g, '-')}` },
    { label: `Pizzerías en ${city.name}` }
  ];
}

export function generateKeywordCityBreadcrumbs(keyword: Keyword, city: City) {
  return [
    { label: 'Inicio', href: '/' },
    { label: `Pizzerías en ${city.province}`, href: `/provincia/${city.province.toLowerCase().replace(/\s+/g, '-')}` },
    { label: `Pizzerías en ${city.name}`, href: `/ciudad/${city.slug}` },
    { label: `${keyword.name} en ${city.name}` }
  ];
}
