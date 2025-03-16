import { NextResponse } from 'next/server';
import { getAllCombinations, parseCitiesCSV, getProvinces } from '../../../utils/csvParser';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pizzerias-argentina.vercel.app';
    const cities = parseCitiesCSV();
    const provinces = getProvinces(cities);
    const combinations = getAllCombinations();
    
    // Create XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add homepage
    xml += `  <url>\n    <loc>${baseUrl}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    
    // Add province pages
    provinces.forEach(province => {
      xml += `  <url>\n    <loc>${baseUrl}/provincia/${province.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });
    
    // Add city pages
    cities.forEach(city => {
      xml += `  <url>\n    <loc>${baseUrl}/ciudad/${city.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });
    
    // Add keyword+city pages
    combinations.forEach(({ keyword, city }) => {
      xml += `  <url>\n    <loc>${baseUrl}/pizzerias/${keyword.slug}/${city.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });
    
    // Close XML
    xml += '</urlset>';
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return NextResponse.json(
      { error: 'Error generating sitemap' },
      { status: 500 }
    );
  }
}
