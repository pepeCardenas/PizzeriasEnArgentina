import { NextResponse } from 'next/server';
import { getCollection } from '../../../lib/mongodb';

// Mark this route as dynamic to prevent caching
export const dynamic = 'force-dynamic';

// Initialize the counter if it doesn't exist
async function initializeCounter() {
  try {
    const collection = await getCollection('pizzerias', 'stats');
    const counter = await collection.findOne({ type: 'visits' });
    
    if (!counter) {
      console.log('Initializing visit counter');
      await collection.insertOne({
        type: 'visits',
        count: 1,
        lastUpdated: new Date()
      });
      return 1;
    }
    
    return counter.count;
  } catch (error) {
    console.error('Error initializing counter:', error);
    // Return a fallback value
    return 1000;
  }
}

// Increment the counter
async function incrementCounter() {
  try {
    const collection = await getCollection('pizzerias', 'stats');
    
    // First check if the counter exists
    const counter = await collection.findOne({ type: 'visits' });
    if (!counter) {
      return await initializeCounter();
    }
    
    // Increment the counter
    const result = await collection.findOneAndUpdate(
      { type: 'visits' },
      { $inc: { count: 1 }, $set: { lastUpdated: new Date() } },
      { returnDocument: 'after' }
    );
    
    const newCount = result?.value?.count || counter.count + 1;
    console.log(`Incremented visit count to ${newCount}`);
    return newCount;
  } catch (error) {
    console.error('Error incrementing counter:', error);
    // Return a fallback value
    return 1000;
  }
}

// Get the current count
async function getCount() {
  try {
    const collection = await getCollection('pizzerias', 'stats');
    const counter = await collection.findOne({ type: 'visits' });
    
    if (!counter) {
      return await initializeCounter();
    }
    
    console.log(`Current visit count: ${counter.count}`);
    return counter.count;
  } catch (error) {
    console.error('Error getting count:', error);
    // Return a fallback value
    return 1000;
  }
}

// GET handler - returns the current count
export async function GET() {
  try {
    const count = await getCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting visit count:', error);
    // Return a fallback value in case of error
    return NextResponse.json({ count: 1000 });
  }
}

// POST handler - increments the counter and returns the new count
export async function POST() {
  try {
    const count = await incrementCounter();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error incrementing visit count:', error);
    // Return a fallback value in case of error
    return NextResponse.json({ count: 1000 });
  }
}
