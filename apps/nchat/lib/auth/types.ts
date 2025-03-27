export type UserRole = 'admin' | 'user' | 'guest';

export interface User {
  id: string;
  aud: string;
  role: string;
  email: string;
  phone: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  metadata?: Record<string, any>;
  identities: any[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

export interface AuthSession {
  user: User;
  accessToken?: string;
}

export interface AuthResponse {
  data: AuthSession | null;
  error: Error | null;
}

export interface AuthService {
  signInWithPassword(email: string, password: string): Promise<AuthResponse>;
  signInAnonymously(): Promise<AuthResponse>;
  signOut(): Promise<{ error: Error | null }>;
  getSession(): Promise<AuthResponse>;
  updateUser(updates: Partial<User>): Promise<AuthResponse>;
  convertAnonymousUser(email: string, password: string): Promise<AuthResponse>;
  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void;
} 