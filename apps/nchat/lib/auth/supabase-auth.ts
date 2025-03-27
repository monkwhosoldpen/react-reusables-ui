import { supabase } from '../supabase';
import { AuthService, AuthResponse, AuthSession, User } from './types';

export class SupabaseAuthService implements AuthService {
  async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user || !data.session) {
        throw new Error('No user data returned');
      }

      return {
        data: {
          user: {
            ...data.user,
            metadata: data.user.user_metadata || {},
            is_anonymous: !data.user.user_metadata?.full_name,
          } as User,
          accessToken: data.session.access_token,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error in signInWithPassword:', error);
      return { data: null, error: error as Error };
    }
  }

  async signInAnonymously(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) throw error;
      if (!data.user || !data.session) {
        throw new Error('No user data returned');
      }

      return {
        data: {
          user: {
            ...data.user,
            metadata: data.user.user_metadata || {},
            is_anonymous: !data.user.user_metadata?.full_name,
          } as User,
          accessToken: data.session.access_token,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error in signInAnonymously:', error);
      return { data: null, error: error as Error };
    }
  }

  async convertAnonymousUser(email: string, password: string): Promise<AuthResponse> {
    try {
      // First update the user with email
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        email,
      });

      if (updateError) throw updateError;

      // After email verification, update password
      const { data: passwordData, error: passwordError } = await supabase.auth.updateUser({
        password,
      });

      if (passwordError) throw passwordError;

      return {
        data: {
          user: passwordData.user as User,
          accessToken: passwordData.user.role,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error in convertAnonymousUser:', error);
      return { data: null, error: error as Error };
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error in signOut:', error);
      return { error: error as Error };
    }
  }

  async getSession(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;
      if (!data.session?.user) {
        return { data: null, error: null };
      }

      return {
        data: {
          user: {
            ...data.session.user,
            metadata: data.session.user.user_metadata || {},
            is_anonymous: !data.session.user.user_metadata?.full_name,
          } as User,
          accessToken: data.session.access_token,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error in getSession:', error);
      return { data: null, error: error as Error };
    }
  }

  async updateUser(updates: Partial<User>): Promise<AuthResponse> {
    try {
      // Ensure we're updating the metadata correctly
      const { data, error } = await supabase.auth.updateUser({
        data: updates.user_metadata || updates.metadata,
        email: updates.email,
        phone: updates.phone,
      });

      if (error) throw error;
      if (!data.user) {
        throw new Error('No user data returned');
      }

      // Get the latest session to ensure we have the most up-to-date metadata
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      return {
        data: {
          user: {
            ...data.user,
            user_metadata: data.user.user_metadata || {},
            metadata: data.user.user_metadata || {},
            is_anonymous: !data.user.user_metadata?.full_name,
          } as User,
          accessToken: sessionData.session?.access_token,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error in updateUser:', error);
      return { data: null, error: error as Error };
    }
  }

  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          callback({
            user: session.user as User,
            accessToken: session.access_token,
          });
        } else {
          callback(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }
} 