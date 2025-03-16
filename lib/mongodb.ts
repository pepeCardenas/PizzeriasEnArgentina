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
    
    // Check if cache is expired (6 months = 15,768,000,000 milliseconds)
    const SIX_MONTHS = 15768000000;
    if (Date.now() - cacheItem.timestamp > SIX_MONTHS) {
      await collection.deleteOne({ key });
      return null;
    }
    
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
