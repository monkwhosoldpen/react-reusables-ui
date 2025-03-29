import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Define types based on your table structure
interface TenantRequest {
  id: string;  // UUID
  type: string;
  uid: string;
  username: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

// Define webhook payload type
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: TenantRequest;
  old_record?: TenantRequest;
}

// Test endpoint to check Supabase connection
export async function GET(request: NextRequest) {
  try {
    // Try to query the tenant_requests table
    const { data, error } = await supabaseAdmin
      .from('tenant_requests')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to connect to Supabase', 
        error 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully connected to Supabase', 
      data 
    });
  } catch (error: any) {
    console.error('Error in GET:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing Supabase connection', 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: WebhookPayload = await request.json();
    const { type, table, record } = body;

    // Only process events from tenant_requests table
    if (table !== 'tenant_requests') {
      return NextResponse.json({ message: 'Ignored event for different table' });
    }

    // Only process INSERT or UPDATE events
    if (type !== 'INSERT' && type !== 'UPDATE') {
      return NextResponse.json({ message: 'Ignored non-insert/update event' });
    }

    // First, verify if the user exists in auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(record.uid);
    
    if (userError || !userData) {
      console.error('User not found:', userError);
      return NextResponse.json({ 
        error: 'User not found', 
        details: userError 
      }, { status: 404 });
    }

    const { data, error: updateError } = await supabaseAdmin
      .from('tenant_requests')
      .upsert({
        id: record.id,
        type: record.type,
        uid: record.uid,
        username: record.username,
        status: record.status,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update tenant_requests', 
        details: updateError 
      }, { status: 500 });
    }

    // Fetch updated tenant requests for the user
    const { data: channelActivity, error: activityError } = await supabaseAdmin.rpc(
      'getchannelactivitysigneduser',
      {
        p_user_id: record.uid
      }
    );

    if (activityError) {
      console.error('Error fetching updated channel activity:', activityError);
      console.error('User ID used:', record.uid);
    }

    return NextResponse.json({
      success: true,
      message: 'Tenant request updated successfully',
      data: {
        ...data,
        tenantRequests: channelActivity?.tenantRequests || []
      }
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 