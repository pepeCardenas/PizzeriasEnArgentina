import { MongoClient, ServerApiVersion } from 'mongodb';

// This module is designed to be used only on the server side
// The check is commented out to allow Next.js to build the app
// but the module will still only be executed on the server
// 
// if (typeof window !== 'undefined') {
//   throw new Error(
//     'This module should only be used on the server side. Please make sure you are not importing it in client components.'
//   );
// }

// Use environment variable for MongoDB URI
const uri = process.env.MONGODB_URI;

// During build time, we might not have access to environment variables
// So we need to handle this case gracefully
if (!uri) {
  // Only warn in development mode
  if (process.env.NODE_ENV !== 'production' && process.env.VERCEL_ENV !== 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
    console.warn('MONGODB_URI environment variable is not set. Please check your .env.local file.');
  } else {
    // In production, log more details
    console.error('MONGODB_URI environment variable is not set in production!');
    console.error('Environment:', process.env.NODE_ENV);
    console.error('Vercel environment:', process.env.VERCEL_ENV);
    console.error('Available environment variables:', Object.keys(process.env).filter(key => !key.includes('SECRET')));
  }
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

let client: MongoClient;
// Initialize clientPromise as undefined to fix TypeScript error
let clientPromise: Promise<MongoClient> | undefined = undefined;

// Only create a client if we have a URI
if (uri) {
  try {
    if (process.env.NODE_ENV === 'development') {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
      };

      if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect().catch(err => {
          console.error('Failed to connect to MongoDB:', err);
          throw err;
        });
      }
      clientPromise = globalWithMongo._mongoClientPromise;
    } else {
      // In production mode, it's best to not use a global variable.
      console.log('Initializing MongoDB client in production mode');
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Vercel environment:', process.env.VERCEL_ENV);
      
      client = new MongoClient(uri, options);
      clientPromise = client.connect().catch(err => {
        console.error('Failed to connect to MongoDB in production:', err);
        // Log more details about the error
        if (err instanceof Error) {
          console.error('Error name:', err.name);
          console.error('Error message:', err.message);
          console.error('Error stack:', err.stack);
        }
        throw err;
      });
    }
  } catch (error) {
    console.error('Error initializing MongoDB client:', error);
    // Don't throw here, let the application continue without MongoDB
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Helper function to get a collection
export async function getCollection(dbName: string, collectionName: string) {
  if (!clientPromise) {
    console.error('MongoDB client not initialized. MONGODB_URI environment variable may not be set.');
    
    // In production, log more details about the environment
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
      console.error('Environment variables available:', Object.keys(process.env).filter(key => !key.includes('SECRET')));
      console.error('MONGODB_URI defined:', !!process.env.MONGODB_URI);
      if (process.env.MONGODB_URI) {
        // Log a sanitized version of the URI (hide username/password)
        const sanitizedUri = process.env.MONGODB_URI.replace(
          /(mongodb(\+srv)?:\/\/)([^:]+):([^@]+)@/,
          '$1***:***@'
        );
        console.error('MONGODB_URI format:', sanitizedUri);
      }
    }
    
    // Return a dummy collection that will fail gracefully
    return {
      findOne: async () => null,
      updateOne: async () => ({ acknowledged: false }),
      deleteOne: async () => ({ acknowledged: false }),
      deleteMany: async () => ({ acknowledged: false, deletedCount: 0 }),
      insertOne: async () => ({ acknowledged: false })
    } as any;
  }
  
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    return db.collection(collectionName);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    
    // Return a dummy collection that will fail gracefully
    return {
      findOne: async () => null,
      updateOne: async () => ({ acknowledged: false }),
      deleteOne: async () => ({ acknowledged: false }),
      deleteMany: async () => ({ acknowledged: false, deletedCount: 0 }),
      insertOne: async () => ({ acknowledged: false })
    } as any;
  }
}

// Cache management functions
export async function getCachedData(key: string) {
  try {
    const collection = await getCollection('pizzerias', 'cache');
    const cacheItem = await collection.findOne({ key });
    
    if (!cacheItem) return null;
    
    // Check if cache is expired
    // Different expiration times based on data type:
    const FIVE_MINUTES = 300000; // 5 minutes for pagination data
    const ONE_HOUR = 3600000;    // 1 hour for search results
    const ONE_DAY = 86400000;    // 1 day for other data
    
    // Determine expiration time based on key content
    let expirationTime = ONE_DAY; // Default
    
    if (key.includes('first_page')) {
      // First page results expire after 1 hour
      expirationTime = ONE_HOUR;
    } else if (key.includes('page') || key.includes('token')) {
      // Pagination data (non-first page) expires very quickly
      expirationTime = FIVE_MINUTES;
      console.log(`Using short expiration for pagination data: ${key}`);
    }
    
    if (Date.now() - cacheItem.timestamp > expirationTime) {
      console.log(`Cache expired for key: ${key} (age: ${(Date.now() - cacheItem.timestamp) / 1000} seconds)`);
      await collection.deleteOne({ key });
      return null;
    }
    
    console.log(`Cache hit for key: ${key} (age: ${(Date.now() - cacheItem.timestamp) / 1000} seconds)`);
    return cacheItem.data;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
}

export async function setCachedData(key: string, data: any) {
  try {
    const collection = await getCollection('pizzerias', 'cache');
    
    // Upsert the cache item
    await collection.updateOne(
      { key },
      { $set: { data, timestamp: Date.now() } },
      { upsert: true }
    );
    
    return data;
  } catch (error) {
    console.error('Error setting cached data:', error);
    return data;
  }
}

/**
 * Clear cache entries for a specific keyword and city combination
 * This is useful for pagination to ensure fresh data
 */
export async function clearCacheForKeywordCity(keyword: string, city: string) {
  try {
    const collection = await getCollection('pizzerias', 'cache');
    
    // Create a regex pattern to match all cache keys for this keyword/city combination
    const keyPattern = new RegExp(`^${keyword}_${city}`);
    
    // Find and delete all matching cache entries
    const result = await collection.deleteMany({ 
      key: { $regex: keyPattern } 
    });
    
    console.log(`Cleared ${result.deletedCount} cache entries for ${keyword} in ${city}`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return 0;
  }
}

/**
 * Store complete search results with all page tokens
 * This allows for efficient pagination without having to make multiple API calls
 */
export async function storeCompleteSearchResults(
  keyword: string, 
  city: string, 
  completeResults: import('../types').CompleteSearchResult
) {
  try {
    const collection = await getCollection('pizzerias', 'cache');
    const key = `complete_${keyword}_${city}`;
    
    // Store the complete results
    await collection.updateOne(
      { key },
      { 
        $set: { 
          data: completeResults, 
          timestamp: Date.now(),
          type: 'complete_search'
        } 
      },
      { upsert: true }
    );
    
    console.log(`Stored complete search results for ${keyword} in ${city} with ${completeResults.totalResults} results and ${completeResults.maxPages} pages`);
    return true;
  } catch (error) {
    console.error('Error storing complete search results:', error);
    return false;
  }
}

/**
 * Get complete search results for a keyword and city
 */
export async function getCompleteSearchResults(keyword: string, city: string) {
  try {
    const collection = await getCollection('pizzerias', 'cache');
    const key = `complete_${keyword}_${city}`;
    
    const cacheItem = await collection.findOne({ key });
    
    if (!cacheItem) {
      console.log(`No complete search results found for ${keyword} in ${city}`);
      return null;
    }
    
    // Check if cache is expired (1 day)
    const ONE_DAY = 86400000;
    
    if (Date.now() - cacheItem.timestamp > ONE_DAY) {
      console.log(`Complete search results expired for ${keyword} in ${city}`);
      await collection.deleteOne({ key });
      return null;
    }
    
    console.log(`Found complete search results for ${keyword} in ${city} with ${cacheItem.data.totalResults} results and ${cacheItem.data.maxPages} pages`);
    return cacheItem.data as import('../types').CompleteSearchResult;
  } catch (error) {
    console.error('Error getting complete search results:', error);
    return null;
  }
}

// Form submission function
export async function saveFormSubmission(formData: any) {
  if (!clientPromise) {
    throw new Error('MongoDB client not initialized. Check your MONGODB_URI environment variable.');
  }
  
  try {
    const collection = await getCollection('pizzerias', 'submissions');
    const result = await collection.insertOne({
      ...formData,
      createdAt: new Date()
    });
    
    return result;
  } catch (error) {
    console.error('Error saving form submission:', error);
    throw error;
  }
}
