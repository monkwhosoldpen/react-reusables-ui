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
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
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
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
};

export const createMessage = async (formData: FormDataType, username: string) => {
  try {
    const createData = {
      channel_username: username,
      type: formData.type || 'whatsapp',
      content: formData.content,
      caption: formData.caption,
      media: formData.media || [],
      metadata: {
        ...formData.metadata,
        displayMode: formData.metadata?.displayMode ?? 'default',
        maxHeight: formData.metadata?.maxHeight ?? 300,
        visibility: {
          stats: true,
          shareButtons: true,
          header: true
        },
        mediaLayout: formData.metadata?.mediaLayout ?? 'grid',
        requireAuth: formData.metadata?.requireAuth ?? false,
        timestamp: formData.metadata?.timestamp ?? new Date().toISOString()
      },
      interactive_content: formData.interactive_content || {}
    };

    const { data, error } = await supabase
      .from('superfeed')
      .insert([createData])
      .select();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}; 