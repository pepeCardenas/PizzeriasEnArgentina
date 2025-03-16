import { NextResponse } from 'next/server';
import { parseKeywordsCSV } from '../../../utils/csvParser';

export async function GET() {
  try {
    const keywords = parseKeywordsCSV();
    return NextResponse.json(keywords);
  } catch (error) {
    console.error('Error fetching keywords:', error);
    return NextResponse.json(
      { error: 'Error fetching keywords' },
      { status: 500 }
    );
  }
}
