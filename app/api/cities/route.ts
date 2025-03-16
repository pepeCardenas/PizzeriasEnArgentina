import { NextResponse } from 'next/server';
import { parseCitiesCSV } from '../../../utils/csvParser';

export async function GET() {
  try {
    const cities = parseCitiesCSV();
    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Error fetching cities' },
      { status: 500 }
    );
  }
}
