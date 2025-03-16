import fs from 'fs';
import path from 'path';
import { City, Keyword, Province } from '../types';

// Function to convert string to slug
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

// Parse cities.csv
export function parseCitiesCSV(): City[] {
  try {
    console.log('Parsing cities.csv...');
    // Look for the CSV file in the project root directory
    const filePath = path.join(process.cwd(), 'pizzerias', 'cities.csv');
    console.log('Cities file path:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('Cities file not found at:', filePath);
      
      // Try alternative path
      const altPath = path.join(process.cwd(), 'cities.csv');
      console.log('Trying alternative path:', altPath);
      
      if (!fs.existsSync(altPath)) {
        console.error('Cities file not found at alternative path either');
        return [];
      }
      
      // Use alternative path
      const fileContent = fs.readFileSync(altPath, 'utf8');
      return parseCitiesContent(fileContent);
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return parseCitiesContent(fileContent);
  } catch (error) {
    console.error('Error parsing cities CSV:', error);
    return [];
  }
}

// Helper function to parse cities content
function parseCitiesContent(fileContent: string): City[] {
  console.log('Cities file content length:', fileContent.length);
  
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');
  console.log('Cities file lines:', lines.length);
  
  const cities: City[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    console.log(`Processing city line ${i}:`, line);
    
    const parts = line.split(',');
    
    if (parts.length >= 3) {
      const id = parts[0].trim();
      const name = parts[1].trim();
      const province = parts[2].trim();
      const population = parts.length > 3 ? parts[3].trim() : '';
      
      if (id && name && province) {
        const city = {
          id: parseInt(id),
          name: name,
          province: province,
          population: population,
          slug: slugify(name)
        };
        
        console.log('Created city object:', city);
        cities.push(city);
      }
    }
  }
  
  console.log(`Parsed ${cities.length} cities`);
  return cities;
}

// Parse keywords.csv
export function parseKeywordsCSV(): Keyword[] {
  try {
    console.log('Parsing keywords.csv...');
    // Look for the CSV file in the project root directory
    const filePath = path.join(process.cwd(), 'pizzerias', 'keywords.csv');
    console.log('Keywords file path:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('Keywords file not found at:', filePath);
      
      // Try alternative path
      const altPath = path.join(process.cwd(), 'keywords.csv');
      console.log('Trying alternative path:', altPath);
      
      if (!fs.existsSync(altPath)) {
        console.error('Keywords file not found at alternative path either');
        return [];
      }
      
      // Use alternative path
      const fileContent = fs.readFileSync(altPath, 'utf8');
      return parseKeywordsContent(fileContent);
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return parseKeywordsContent(fileContent);
  } catch (error) {
    console.error('Error parsing keywords CSV:', error);
    return [];
  }
}

// Helper function to parse keywords content
function parseKeywordsContent(fileContent: string): Keyword[] {
  console.log('Keywords file content length:', fileContent.length);
  
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');
  console.log('Keywords file lines:', lines.length);
  
  const keywords: Keyword[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    console.log(`Processing keyword line ${i}:`, line);
    
    // Handle both "#,keyword" and "#id,keyword" formats
    let id, name;
    if (line.includes(',')) {
      const parts = line.split(',');
      id = parts[0].trim().replace(/\D/g, ''); // Remove non-digit characters
      name = parts.slice(1).join(',').trim(); // Join the rest in case keyword has commas
      
      console.log(`Parsed keyword: id=${id}, name=${name}`);
    } else {
      console.log('Invalid keyword line format, skipping:', line);
      continue; // Skip invalid lines
    }
    
    if (id && name) {
      const keyword = {
        id: parseInt(id),
        name: name,
        slug: slugify(name)
      };
      
      console.log('Created keyword object:', keyword);
      keywords.push(keyword);
    }
  }
  
  console.log(`Parsed ${keywords.length} keywords`);
  return keywords;
}

// Group cities by province
export function getProvinces(cities: City[]): Province[] {
  const provinceMap = new Map<string, City[]>();
  
  cities.forEach(city => {
    if (!provinceMap.has(city.province)) {
      provinceMap.set(city.province, []);
    }
    provinceMap.get(city.province)?.push(city);
  });
  
  const provinces: Province[] = [];
  
  provinceMap.forEach((cities, provinceName) => {
    provinces.push({
      name: provinceName,
      slug: slugify(provinceName),
      cities
    });
  });
  
  return provinces;
}

// Get all possible combinations of keywords and cities
export function getAllCombinations(): { keyword: Keyword; city: City }[] {
  const cities = parseCitiesCSV();
  const keywords = parseKeywordsCSV();
  const combinations: { keyword: Keyword; city: City }[] = [];
  
  keywords.forEach(keyword => {
    cities.forEach(city => {
      combinations.push({ keyword, city });
    });
  });
  
  return combinations;
}
