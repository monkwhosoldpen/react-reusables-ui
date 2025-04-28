import { createClient } from '@supabase/supabase-js';
import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';

const janedoe_tenant_supabase_url = 'https://risbemjewosmlvzntjkd.supabase.co';
const janedoe_tenant_supabase_anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM';

const supabase = createClient(janedoe_tenant_supabase_url, janedoe_tenant_supabase_anon_key);

export const fetchMessageCount = async (username: string) => {
  try {
    const { data, error } = await supabase
      .from('superfeed')
      .select('id', { count: 'exact' })
      .eq('channel_username', username);

    if (error) {
      console.error('Error fetching message count:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error in fetchMessageCount:', error);
    return 0;
  }
};

export const fetchMessages = async (username: string) => {
  try {
    const { data, error } = await supabase
      .from('superfeed')
      .select('*')
      .eq('channel_username', username)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchMessages:', error);
    return [];
  }
};

export const createMessage = async (formData: FormDataType, username: string) => {
  try {
    const createData: FormDataType = {
      ...formData,
      channel_username: username,
      type: formData.type || 'all',
      metadata: {
        ...formData.metadata,
        displayMode: formData.metadata?.displayMode ?? 'default',
        maxHeight: formData.metadata?.maxHeight ?? 300,
        visibility: formData.metadata?.visibility ?? 'public',
        requireAuth: formData.metadata?.requireAuth ?? false,
        allowResubmit: formData.metadata?.allowResubmit ?? false,
        timestamp: formData.metadata?.timestamp ?? new Date().toISOString()
      }
    };

    const { data, error } = await supabase
      .from('superfeed')
      .insert([createData])
      .select();

    if (error) {
      console.error('Error creating message:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createMessage:', error);
    return null;
  }
}; 