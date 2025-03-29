import { NextResponse } from 'next/server';

/**
 * Main Alerts API Route
 * 
 * This is the main entry point for all alert endpoints in the application.
 * It provides information about available alert endpoints and their purposes.
 * 
 * Available alert endpoints:
 * - /api/alerts/push - General push notifications
 * - /api/alerts/elon - Elon Musk specific alerts
 */

export async function GET(request: Request) {
  try {
    // Get the base URL from the request or use a default
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    request.headers.get('host') ? 
                    `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}` : 
                    'http://localhost:3000';
    
    // List of available alert endpoints
    const alertEndpoints = [
      {
        path: `${baseUrl}/api/alerts/push`,
        description: 'General push notifications to all users or specific users',
        methods: ['POST'],
        required_params: ['title', 'message']
      },
      {
        path: `${baseUrl}/api/alerts/elon`,
        description: 'Elon Musk specific alerts to followers',
        methods: ['GET', 'POST'],
        required_params: ['title', 'message'] // Only for POST
      }
    ];

    return NextResponse.json({
      message: 'Alert API endpoints information',
      endpoints: alertEndpoints,
      current_time: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in main alerts endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error.message },
      { status: 500 }
    );
  }
} 