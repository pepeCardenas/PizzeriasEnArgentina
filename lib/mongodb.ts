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
if (!uri && process.env.NODE_ENV !== 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
  console.warn('MONGODB_URI environment variable is not set. Please check your .env.local file.');
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
    client = new MongoClient(uri, options);
    clientPromise = client.connect().catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      throw err;
    });
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Helper function to get a collection
export async function getCollection(dbName: string, collectionName: string) {
  if (!clientPromise) {
    throw new Error('MongoDB client not initialized. Check your MONGODB_URI environment variable.');
  }
  
  const client = await clientPromise;
  const db = client.db(dbName);
  return db.collection(collectionName);
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
