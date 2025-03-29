import { NextResponse } from 'next/server';

/**
 * Main Crons API Route
 * 
 * This is the main entry point for all cron jobs in the application.
 * It provides information about available cron endpoints and their purposes.
 * 
 * Available cron endpoints:
 * - /api/crons/global - Inserts messages for global users
 * - /api/crons/tenant - Inserts messages for tenant users
 * - /api/crons/elon - Triggers Elon Musk alerts
 */

export async function GET(request: Request) {
  try {
    // Get the base URL from the request or use a default
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    request.headers.get('host') ? 
                    `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}` : 
                    'http://localhost:3000';
    
    // List of available cron endpoints
    const cronEndpoints = [
      {
        path: `${baseUrl}/api/crons/global`,
        description: 'Inserts messages for global users',
        recommended_schedule: 'Every 5 minutes'
      },
      {
        path: `${baseUrl}/api/crons/tenant`,
        description: 'Inserts messages for tenant users',
        recommended_schedule: 'Every 10 minutes'
      },
      {
        path: `${baseUrl}/api/crons/elon`,
        description: 'Triggers Elon Musk alerts',
        recommended_schedule: 'Daily'
      }
    ];

    return NextResponse.json({
      message: 'Cron API endpoints information',
      endpoints: cronEndpoints,
      current_time: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in main crons endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error.message },
      { status: 500 }
    );
  }
} 