import { NextRequest, NextResponse } from 'next/server';
import { saveFormSubmission } from '../../../lib/mongodb';

export const dynamic = 'force-dynamic'; // Ensure this route is not statically optimized

export async function POST(request: NextRequest) {
  try {
    // Get client IP address
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Parse request body
    const body = await request.json();
    const { name, email, message } = body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }
    
    // Add IP address and submission timestamp if not already present
    const enrichedData = {
      ...body,
      ipAddress: body.ipAddress || ip,
      submittedAt: new Date().toISOString(),
      userAgent: body.userAgent || request.headers.get('user-agent') || 'unknown'
    };
    
    try {
      // Save to MongoDB
      const result = await saveFormSubmission(enrichedData);
      return NextResponse.json({ success: true, id: result.insertedId });
    } catch (dbError) {
      console.error('MongoDB error:', dbError);
      return NextResponse.json(
        { error: 'Database error. Please try again later.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json(
      { error: 'Error processing form submission' },
      { status: 500 }
    );
  }
}
