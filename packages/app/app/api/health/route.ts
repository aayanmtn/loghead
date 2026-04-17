import { NextResponse } from 'next/server';

/**
 * Health check endpoint for container orchestration
 * Returns 200 OK when the application is healthy
 */
export async function GET() {
  return NextResponse.json(
    { 
      status: 'healthy',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
