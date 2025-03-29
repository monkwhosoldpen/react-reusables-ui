import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    // Get the raw request body as text first
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);
    
    // Try to parse the JSON
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError: any) {
      console.error('JSON parsing error:', parseError);
      
      // Find the position of the error
      const position = parseError.message.match(/position (\d+)/)?.[1];
      let errorContext = '';
      
      if (position) {
        const pos = parseInt(position);
        const start = Math.max(0, pos - 20);
        const end = Math.min(rawBody.length, pos + 20);
        errorContext = `...${rawBody.substring(start, pos)}[ERROR HERE]${rawBody.substring(pos, end)}...`;
      }
      
      return NextResponse.json({ 
        success: false, 
        error: `JSON parsing error: ${parseError.message}`,
        errorPosition: position,
        errorContext,
        // Only include a truncated version of the raw body if it's not too large
        rawBodyPreview: rawBody.length > 1000 ? rawBody.substring(0, 1000) + '...' : rawBody
      }, { status: 400 });
    }
    
    const { type, table, record, old_record } = body;

    // Log the received webhook
    console.log('Received webhook payload:', JSON.stringify(body, null, 2));

    // Check if this is for the tenant_requests table
    if (table !== 'tenant_requests') {
      return NextResponse.json({ 
        success: false, 
        message: `Ignored event for table: ${table}. Expected: tenant_requests`
      }, { status: 400 });
    }

    // Handle different event types
    let result;
    
    switch (type) {
      case 'INSERT':
        if (!record) {
          return NextResponse.json({ 
            success: false, 
            message: 'No record found in INSERT webhook payload'
          }, { status: 400 });
        }
        
        console.log('Inserting new record with ID:', record.id);
        result = await supabaseAdmin
          .from('tenant_requests')
          .insert(record)
          .select();
        break;
        
      case 'UPDATE':
        if (!record) {
          return NextResponse.json({ 
            success: false, 
            message: 'No record found in UPDATE webhook payload'
          }, { status: 400 });
        }
        
        console.log('Updating record with ID:', record.id);
        console.log('Old status:', old_record?.status, 'New status:', record.status);
        
        result = await supabaseAdmin
          .from('tenant_requests')
          .update(record)
          .eq('id', record.id)
          .select();
        break;
        
      case 'DELETE':
        if (!old_record) {
          return NextResponse.json({ 
            success: false, 
            message: 'No old_record found in DELETE webhook payload'
          }, { status: 400 });
        }
        
        console.log('Deleting record with ID:', old_record.id);
        result = await supabaseAdmin
          .from('tenant_requests')
          .delete()
          .eq('id', old_record.id);
        break;
        
      default:
        return NextResponse.json({ 
          success: false, 
          message: `Unsupported event type: ${type}`
        }, { status: 400 });
    }

    // Check for errors
    if (result.error) {
      console.error(`Error processing ${type} operation:`, result.error);
      return NextResponse.json({ 
        success: false, 
        message: `Error processing ${type} operation: ${result.error.message}`,
        error: result.error
      }, { status: 500 });
    }

    console.log(`${type} operation successful:`, JSON.stringify(result.data, null, 2));
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: `${type} operation processed successfully`,
      data: result.data,
      eventType: type,
      recordId: record?.id || old_record?.id
    });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 