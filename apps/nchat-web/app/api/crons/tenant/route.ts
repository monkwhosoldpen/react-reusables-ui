import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TENANT_SUPABASE_URL = 'https://risbemjewosmlvzntjkd.supabase.co';
const TENANT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM';

const supabase = createClient(TENANT_SUPABASE_URL, TENANT_SUPABASE_ANON_KEY);
// Constants for Global Supabase
const GLOBAL_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ilzjdtlikhhavnfzfnvj.supabase.co';
const GLOBAL_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsempkdGxpa2hoYXZuZnpmbnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwODAzODksImV4cCI6MjA1NTY1NjM4OX0.dweaUpbV3YQvQK4VFCQYAeTSLW_FRVKeeLyZbJ8x5oQ';

const supabaseGlobal = createClient(GLOBAL_SUPABASE_URL, GLOBAL_SUPABASE_ANON_KEY);

// Mocked usernames array for Tenant Supabase
const tenantUsernames = [
  "janedoe_farmers",
  "janedoe_weather",
  "janedoe_superfans",
  "janedoe_employees",
  "janedoe_barbers",
  "janedoe_youth",
  "janedoe_yoga",
  "janedoe_dancers",
  "janedoe_help",
  "janedoe_1v1"
];

// Fetch a random Chuck Norris joke
async function fetchChuckNorrisJoke() {
  try {
    const response = await fetch('https://api.chucknorris.io/jokes/random');
    const data = await response.json();
    return data.value; // The joke itself
  } catch (error) {
    return 'Oops! Could not fetch a Chuck Norris joke at the moment.';
  }
}

export async function GET(request: Request) {
  try {
    const joke = await fetchChuckNorrisJoke();
    const messageText = `${joke} Timestamp: ${new Date().toISOString()}`;
    const results = [];
    for (const tenantUsername of tenantUsernames) {
      try {
        const { data: insertedMessage, error: insertError } = await supabase
          .from('channels_messages')
          .insert([
            {
              username: tenantUsername,
              message_text: messageText,
              is_translated: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (insertError) {
          results.push({
            username: tenantUsername,
            success: false,
            error: insertError.message
          });
          continue;
        }
        results.push({
          username: tenantUsername,
          success: true,
          messageId: insertedMessage.id
        });
      } catch (error: any) {
        results.push({
          username: tenantUsername,
          success: false,
          error: error.message
        });
      }
    }

    // Return response with tenant and global usernames
    return NextResponse.json({
      success: true,
      message: 'Messages inserted and channel activities updated successfully',
      tenantResults: results,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error.message },
      { status: 500 }
    );
  }
} 