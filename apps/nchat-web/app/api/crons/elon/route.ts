import { NextResponse } from 'next/server';

/**
 * Elon Musk Alerts Cron Job
 * 
 * This endpoint is designed to be called by a cron job scheduler.
 * It triggers the Elon Musk alerts API to send notifications to all Elon followers.
 * 
 * Recommended schedule: Daily or based on specific events
 */

export async function GET(request: Request) {
  try {
    console.log('[DEBUG] Elon Musk alerts cron job triggered');
    
    // Get the current date and time for the alert message
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    
    // Create a custom message for today
    const title = `Elon Musk Update - ${formattedDate}`;
    const message = `Check out the latest from Elon Musk! New content available now.`;
    
    // Call the Elon alerts API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/elon-alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        message
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[DEBUG] Error from Elon alerts API:', errorData);
      return NextResponse.json(
        { error: 'Failed to trigger Elon alerts', details: errorData },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    console.log('[DEBUG] Elon alerts triggered successfully:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Elon Musk alerts triggered successfully',
      title,
      timestamp: new Date().toISOString(),
      result
    });
  } catch (error: any) {
    console.error('[DEBUG] Error in Elon alerts cron job:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error.message },
      { status: 500 }
    );
  }
} 