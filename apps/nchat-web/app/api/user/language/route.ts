import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * User Language API Endpoint
 * 
 * GET: Retrieves the user's language preference
 * POST: Updates the user's language preference
 */

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Fetch language preference from the database
    const { data, error } = await supabaseAdmin
      .from('user_language')
      .select('language')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('[DEBUG] Error fetching language preference:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    // Return the language preference or default to 'english'
    return NextResponse.json({
      success: true,
      language: data?.language || 'english'
    });
  } catch (error: any) {
    console.error('[DEBUG] Error in language API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId, language } = body;

    if (!userId || !language) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and language are required' 
      }, { status: 400 });
    }

    // Validate language
    const validLanguages = ['english', 'telugu', 'kannada', 'hindi', 'tamil', 'malayalam'];
    if (!validLanguages.includes(language)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid language' 
      }, { status: 400 });
    }

    // Upsert language preference in the database
    const { error } = await supabaseAdmin
      .from('user_language')
      .upsert({ 
        user_id: userId, 
        language 
      })
      .select();

    if (error) {
      console.error('[DEBUG] Error updating language preference:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    // Return success
    return NextResponse.json({
      success: true,
      language
    });
  } catch (error: any) {
    console.error('[DEBUG] Error in language API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 