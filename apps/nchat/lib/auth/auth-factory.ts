import { AuthService } from './types';
import { SupabaseAuthService } from './supabase-auth';

export type AuthProvider = 'supabase' | 'firebase' | 'local';

class AuthFactory {
  private static instance: AuthFactory;
  private currentProvider: AuthProvider = 'supabase';
  private authService: AuthService | null = null;

  private constructor() {}

  static getInstance(): AuthFactory {
    if (!AuthFactory.instance) {
      AuthFactory.instance = new AuthFactory();
    }
    return AuthFactory.instance;
  }

  setProvider(provider: AuthProvider) {
    this.currentProvider = provider;
    this.authService = null; // Reset service when provider changes
  }

  getAuthService(): AuthService {
    if (!this.authService) {
      switch (this.currentProvider) {
        case 'supabase':
          this.authService = new SupabaseAuthService();
          break;
        case 'firebase':
          // TODO: Implement Firebase auth service
          throw new Error('Firebase auth service not implemented yet');
        case 'local':
          // TODO: Implement local auth service
          throw new Error('Local auth service not implemented yet');
        default:
          throw new Error(`Unknown auth provider: ${this.currentProvider}`);
      }
    }
    return this.authService;
  }
}

export const authFactory = AuthFactory.getInstance(); 