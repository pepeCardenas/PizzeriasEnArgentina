import { NextResponse } from 'next/server';
import { getCollection } from '../../../lib/mongodb';

// Initialize the counter if it doesn't exist
async function initializeCounter() {
  const collection = await getCollection('pizzerias', 'stats');
  const counter = await collection.findOne({ type: 'visits' });
  
  if (!counter) {
    await collection.insertOne({
      type: 'visits',
      count: 0,
      lastUpdated: new Date()
    });
    return 0;
  }
  
  return counter.count;
}

// Increment the counter
async function incrementCounter() {
  const collection = await getCollection('pizzerias', 'stats');
  const result = await collection.findOneAndUpdate(
    { type: 'visits' },
    { $inc: { count: 1 }, $set: { lastUpdated: new Date() } },
    { returnDocument: 'after', upsert: true }
  );
  
  return result?.value?.count || 1;
}

// Get the current count
async function getCount() {
  const collection = await getCollection('pizzerias', 'stats');
  const counter = await collection.findOne({ type: 'visits' });
  
  if (!counter) {
    return await initializeCounter();
  }
  
  return counter.count;
}

// GET handler - returns the current count
export async function GET() {
  try {
    const count = await getCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting visit count:', error);
    return NextResponse.json(
      { error: 'Error getting visit count' },
      { status: 500 }
    );
  }
}

// POST handler - increments the counter and returns the new count
export async function POST() {
  try {
    const count = await incrementCounter();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error incrementing visit count:', error);
    return NextResponse.json(
      { error: 'Error incrementing visit count' },
      { status: 500 }
    );
  }
}
