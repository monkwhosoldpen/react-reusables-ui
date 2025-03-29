import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GLOBAL_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ilzjdtlikhhavnfzfnvj.supabase.co';
const GLOBAL_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsempkdGxpa2hoYXZuZnpmbnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwODAzODksImV4cCI6MjA1NTY1NjM4OX0.dweaUpbV3YQvQK4VFCQYAeTSLW_FRVKeeLyZbJ8x5oQ';

const supabase = createClient(GLOBAL_SUPABASE_URL, GLOBAL_SUPABASE_ANON_KEY);

interface Channel {
  username: string;
  [key: string]: any; // Allow for additional properties
}

async function fetchChuckNorrisJoke() {
  try {
    const response = await fetch('https://api.chucknorris.io/jokes/random');
    const data = await response.json();
    return data.value; // The joke itself
  } catch (error) {
    console.error('Error fetching Chuck Norris joke:', error);
    return 'Oops! Could not fetch a Chuck Norris joke at the moment.';
  }
}

async function fetchChannels(): Promise<Channel[]> {
  try {
    const response = await fetch('https://www.fixd.ai' + '/api/channels');
    if (!response.ok) {
      throw new Error(`Failed to fetch channels: ${response.status} ${response.statusText}`);
    }
    const channels = await response.json();
    return channels;
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    let channels;
    try {
      channels = await fetchChannels();
    } catch (error) {
      channels = [
        { username: 'elonmusk' },
        { username: 'janedoe' }
      ];
    }
    const usernames = channels.map((channel: Channel) => channel.username);
    const results = {
      successful: [] as string[],
      failed: [] as { username: string, error: any }[]
    };
    
    for (const username of usernames) {
      try {
        const joke = await fetchChuckNorrisJoke();
        const messageText = JSON.stringify(joke);
        const { error } = await supabase
          .from('channels_messages')
          .insert([
            {
              username,
              message_text: messageText,
              is_translated: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (error) {
          results.failed.push({ username, error });
        } else {
          results.successful.push(username);
        }
      } catch (insertError) {
        results.failed.push({ username, error: insertError });
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Messages inserted for Global channels',
      results: {
        total: usernames.length,
        successful: results.successful.length,
        failed: results.failed.length,
        successful_usernames: results.successful,
        failed_details: results.failed.map(f => ({ username: f.username, error: f.error.message || String(f.error) }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in global cron job:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error.message },
      { status: 500 }
    );
  }
} 