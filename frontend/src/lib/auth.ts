import api, { User } from './api';

// Re-export User type
export type { User };

// Authentication context and utilities
export class AuthManager {
  private static instance: AuthManager;
  private currentUser: User | null = null;
  private token: string | null = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  initialize() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('current_user');
      this.currentUser = userStr ? JSON.parse(userStr) : null;
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await api.login(email, password);
      
      // Store token and user immediately for synchronous access
      this.token = response.token;
      this.currentUser = response.user;
      
      // Store in localStorage immediately (synchronous operation)
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.token);
        localStorage.setItem('current_user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    displayName: string;
  }) {
    try {
      const response = await api.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAdmin(): boolean {
    return this.currentUser?.isAdmin || false;
  }

  isModerator(): boolean {
    return this.currentUser?.isModerator || false;
  }

  isVerified(): boolean {
    return this.currentUser?.isVerified || false;
  }
}

export const authManager = AuthManager.getInstance();
