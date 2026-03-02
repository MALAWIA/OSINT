import { User } from './api';

export class AuthManagerClean {
  private static instance: AuthManagerClean;
  private token: string | null = null;
  private currentUser: User | null = null;

  private constructor() {}

  static getInstance(): AuthManagerClean {
    if (!AuthManagerClean.instance) {
      AuthManagerClean.instance = new AuthManagerClean();
    }
    return AuthManagerClean.instance;
  }

  initialize() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('current_user');
      this.currentUser = userStr ? JSON.parse(userStr) : null;
      
      console.log('AuthManager initialized:', {
        token: this.token ? 'present' : 'missing',
        user: this.currentUser ? 'present' : 'missing',
        isAuthenticated: this.isAuthenticated()
      });
    }
  }

  async login(email: string, password: string) {
    try {
      // For testing purposes, accept test credentials
      if (email === 'test@example.com' && password === 'password123') {
        const mockUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          isAdmin: false,
          isModerator: false,
          isVerified: true,
          reputationScore: 0,
          lastActive: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const mockToken = 'mock-jwt-token-for-testing';
        
        // Store token and user
        this.token = mockToken;
        this.currentUser = mockUser;
        
        // Store in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', mockToken);
          localStorage.setItem('current_user', JSON.stringify(mockUser));
        }
        
        console.log('Mock login successful:', { token: mockToken, user: mockUser });
        return { token: mockToken, user: mockUser };
      }

      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store token and user
      this.token = data.token;
      this.currentUser = data.user;
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('current_user', JSON.stringify(data.user));
      }
      
      console.log('Login successful:', { token: data.token, user: data.user });
      return data;
    } catch (error) {
      console.error('Login error:', error);
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
    
    console.log('Logged out successfully');
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

export const authManagerClean = AuthManagerClean.getInstance();
