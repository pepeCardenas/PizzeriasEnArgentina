import { NextResponse } from 'next/server';

// Mark this route as dynamic to prevent caching
export const dynamic = 'force-dynamic';

// POST handler - recreates the cache collection
export async function POST() {
  try {
    console.log('Attempting to recreate cache collection...');
    
    // Get MongoDB client
    const clientPromise = (await import('../../../../lib/mongodb')).default;
    if (!clientPromise) {
      throw new Error('MongoDB client not initialized');
    }
    
    const client = await clientPromise;
    const db = client.db('pizzerias');
    
    // Check if collection exists and drop it
    const collections = await db.listCollections({ name: 'cache' }).toArray();
    if (collections.length > 0) {
      console.log('Dropping existing cache collection');
      await db.collection('cache').drop();
    } else {
      console.log('Cache collection did not exist, will create new one');
    }
    
    // Create a new collection
    await db.createCollection('cache');
    console.log('Created new cache collection');
    
    // Get the new collection
    const collection = db.collection('cache');
    
    // Create an index on the key field
    await collection.createIndex({ key: 1 }, { unique: true });
    console.log('Created index on key field');
    
    // Create a TTL index on the timestamp field
    // Documents will be automatically removed after 7 days
    await collection.createIndex({ timestamp: 1 }, { expireAfterSeconds: 604800 });
    console.log('Created TTL index on timestamp field');
    
    console.log('Cache collection recreated successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache collection recreated successfully' 
    });
  } catch (error) {
    console.error('Error recreating cache collection:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error recreating cache collection',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
