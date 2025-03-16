// Add a check to ensure this module is only used on the server side
if (typeof window !== 'undefined') {
  throw new Error(
    'This module should only be used on the server side. Please make sure you are not importing it in client components.'
  );
}

import { MongoClient, ServerApiVersion } from 'mongodb';

// Use environment variable for MongoDB URI with fallback
const uri = process.env.MONGODB_URI || 'mongodb+srv://jlcardenas:MOjl1000@pizzerias.ul30g.mongodb.net/?retryWrites=true&w=majority&appName=Pizzerias';
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Helper function to get a collection
export async function getCollection(dbName: string, collectionName: string) {
  const client = await clientPromise;
  const db = client.db(dbName);
  return db.collection(collectionName);
}

// Cache management functions
export async function getCachedData(key: string) {
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
}

export async function setCachedData(key: string, data: any) {
  const collection = await getCollection('pizzerias', 'cache');
  
  // Upsert the cache item
  await collection.updateOne(
    { key },
    { $set: { data, timestamp: Date.now() } },
    { upsert: true }
  );
  
  return data;
}

// Form submission function
export async function saveFormSubmission(formData: any) {
  const collection = await getCollection('pizzerias', 'submissions');
  const result = await collection.insertOne({
    ...formData,
    createdAt: new Date()
  });
  
  return result;
}
