import { NextRequest, NextResponse } from 'next/server';
import { searchPizzerias } from '../../../lib/googlePlaces';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, city, page, pageToken } = body;
    
    if (!keyword || !city) {
      return NextResponse.json(
        { error: 'Keyword and city are required' },
        { status: 400 }
      );
    }
    
    const results = await searchPizzerias(keyword, city, page, pageToken);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching pizzerias:', error);
    return NextResponse.json(
      { error: 'Error searching pizzerias' },
      { status: 500 }
    );
  }
}
