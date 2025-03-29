import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Initialize Supabase client on the server
const initSupabase = () => {
  const cookieStore = cookies();
  const supabaseUrl = 'https://risbemjewosmlvzntjkd.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not available');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    },
    global: {
      fetch: fetch.bind(globalThis)
    }
  });
};

// GET handler for fetching tenant requests
export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching tenant requests');
    const supabase = initSupabase();

    // Fetch all tenant requests from the database without filtering by username
    const { data, error } = await supabase
      .from('tenant_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('API: Error fetching tenant requests:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('API: Successfully fetched tenant requests:', data?.length || 0);

    // Format the requests
    const formattedRequests = (data || []).map((request) => {
      // Make sure requestInfo is an object
      let requestInfo = request.requestInfo;
      if (typeof requestInfo === 'string') {
        try {
          requestInfo = JSON.parse(requestInfo);
        } catch (e) {
          console.error('API: Error parsing requestInfo:', e);
        }
      }

      return {
        ...request,
        requestInfo: requestInfo || {}
      };
    });

    return NextResponse.json({ requests: formattedRequests });
  } catch (err) {
    console.error('API: Error in tenant requests API:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

// POST handler for creating a test tenant request
export async function POST(request: NextRequest) {
  try {
    console.log('API: Creating test tenant request');
    const supabase = initSupabase();
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Use a default user ID instead of getting the authenticated user
    const defaultUserId = 'default-user-id';
    console.log('API: Creating request with default user ID:', defaultUserId, 'username:', username);

    // Check if the request_tenant_channel_access RPC function exists
    try {
      // Call the request_tenant_channel_access RPC function
      const { data, error } = await supabase.rpc(
        'request_tenant_channel_access',
        {
          userid: defaultUserId,
          channel_username: username,
          config: {
            requestType: 'test',
            notes: 'Test request created from dashboard'
          }
        }
      );

      if (error) {
        console.error('API: Error creating test tenant request:', error);

        // If the RPC function doesn't exist or fails, try direct table insertion
        if (error.message.includes('does not exist') || error.message.includes('function') || error.message.includes('relation')) {
          console.log('API: Falling back to direct table insertion');

          // Try to insert directly into the tenant_requests table
          const { data: insertData, error: insertError } = await supabase
            .from('tenant_requests')
            .insert({
              requestInfo: {
                userId: defaultUserId,
                channelUsername: username,
                requestedAt: new Date().toISOString(),
                requestType: 'test',
                notes: 'Test request created from dashboard'
              },
              type: 'channel_access',
              uid: defaultUserId,
              username: username,
              status: 'PENDING' // Use consistent text status
            })
            .select();

          if (insertError) {
            console.error('API: Error with direct table insertion:', insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
          }

          console.log('API: Successfully created test tenant request via direct insertion');
          return NextResponse.json({ success: true, request: insertData });
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log('API: Successfully created test tenant request');
      return NextResponse.json({ success: true, request: data });
    } catch (err) {
      console.error('API: Error in create tenant request API:', err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Unknown error occurred' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('API: Error in create tenant request API:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

// PATCH handler for approving or rejecting a tenant request
export async function PATCH(request: NextRequest) {
  try {
    console.log('API: Updating tenant request');
    const supabase = initSupabase();
    const { requestId, action } = await request.json();

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Request ID and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject' && action !== 'reset') {
      return NextResponse.json(
        { error: 'Action must be either "approve", "reject", or "reset"' },
        { status: 400 }
      );
    }

    console.log('API: Processing', action, 'for request ID:', requestId);

    // First, get the request details
    const { data: requestData, error: requestError } = await supabase
      .from('tenant_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !requestData) {
      console.error('API: Error fetching request details:', requestError);
      return NextResponse.json(
        { error: requestError?.message || 'Request not found' },
        { status: 404 }
      );
    }

    // Ensure we have the correct username and user ID
    const username = requestData.username;
    const userId = requestData.uid;

    if (!username || !userId) {
      return NextResponse.json(
        { error: 'Request data is missing username or user ID' },
        { status: 400 }
      );
    }

    console.log('API: Processing request for username:', username, 'user ID:', userId);
    console.log('API: Current status value:', requestData.status, 'type:', typeof requestData.status);

    // Determine the status value based on the action
    let newStatus;
    if (action === 'approve') {
      newStatus = 'APPROVED'; // Use consistent text status
    } else if (action === 'reject') {
      newStatus = 'REJECTED'; // Using text status for rejected
    } else if (action === 'reset') {
      newStatus = 'PENDING'; // Using text status for pending
    }

    console.log('API: Setting new status to:', newStatus);

    // Update the tenant_requests table directly
    const { error: statusError } = await supabase
      .from('tenant_requests')
      .update({ status: newStatus })
      .eq('id', requestId);

    if (statusError) {
      console.error(`API: Error updating request status:`, statusError);
      return NextResponse.json({ error: statusError.message }, { status: 500 });
    }

    console.log('API: Successfully updated request status');

    let actionMessage;
    if (action === 'approve') {
      actionMessage = 'approved';
    } else if (action === 'reject') {
      actionMessage = 'rejected';
    } else {
      actionMessage = 'reset to pending';
    }

    return NextResponse.json({
      success: true,
      message: `Request ${actionMessage} successfully`
    });
  } catch (err) {
    console.error('API: Error in update tenant request API:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 