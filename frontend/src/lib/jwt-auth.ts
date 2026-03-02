import { User } from './api';

// JWT Token Management
export class JWTAuthManager {
  private static instance: JWTAuthManager;
  private token: string | null = null;
  private user: User | null = null;
  private tokenExpiry: number | null = null;

  private constructor() {}

  static getInstance(): JWTAuthManager {
    if (!JWTAuthManager.instance) {
      JWTAuthManager.instance = new JWTAuthManager();
    }
    return JWTAuthManager.instance;
  }

  // Decode JWT token (client-side only for basic info)
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      return null;
    }
  }

  // Check if token is expired
  private isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Initialize from localStorage
  initialize() {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('jwt_token');
      const storedUser = localStorage.getItem('jwt_user');
      const storedExpiry = localStorage.getItem('jwt_expiry');

      if (storedToken && !this.isTokenExpired(storedToken)) {
        this.token = storedToken;
        this.user = storedUser ? JSON.parse(storedUser) : null;
        this.tokenExpiry = storedExpiry ? parseInt(storedExpiry) : null;
        
        console.log('JWT Auth initialized successfully:', {
          hasToken: !!this.token,
          hasUser: !!this.user,
          expiresAt: this.tokenExpiry ? new Date(this.tokenExpiry * 1000).toLocaleString() : 'Unknown'
        });
      } else {
        // Clear expired or invalid tokens
        this.clearAuth();
        console.log('JWT Auth: No valid token found, cleared expired data');
      }
    }
  }

  // Login with JWT
  async login(email: string, password: string) {
    try {
      // For testing purposes, create a mock JWT token
      if (email === 'test@example.com' && password === 'password123') {
        const mockUser: User = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          isAdmin: false,
          isModerator: false,
          isVerified: true,
          reputationScore: 0,
          lastActive: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };

        // Create a mock JWT token (in production, this would come from server)
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = {
          sub: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          displayName: mockUser.displayName,
          isAdmin: mockUser.isAdmin,
          isModerator: mockUser.isModerator,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };

        // Create mock JWT (base64 encoded header.payload.signature)
        const mockJWT = `${btoa(JSON.stringify(header)).replace(/=/g, '')}.${btoa(JSON.stringify(payload)).replace(/=/g, '')}.mock_signature`;

        // Store authentication data
        this.token = mockJWT;
        this.user = mockUser;
        this.tokenExpiry = payload.exp;

        // Store in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('jwt_token', mockJWT);
          localStorage.setItem('jwt_user', JSON.stringify(mockUser));
          localStorage.setItem('jwt_expiry', payload.exp.toString());
        }

        console.log('JWT Login successful:', {
          token: mockJWT.substring(0, 50) + '...',
          user: mockUser,
          expiresAt: new Date(payload.exp * 1000).toLocaleString()
        });

        return { token: mockJWT, user: mockUser };
      }

      // Try actual API login
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
      
      // Store JWT token and user
      this.token = data.token;
      this.user = data.user;
      
      // Decode token to get expiry
      const decoded = this.decodeToken(data.token);
      this.tokenExpiry = decoded?.exp || null;

      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('jwt_user', JSON.stringify(data.user));
        if (this.tokenExpiry) {
          localStorage.setItem('jwt_expiry', this.tokenExpiry.toString());
        }
      }

      console.log('JWT Login successful:', { token: data.token, user: data.user });
      return data;
    } catch (error) {
      console.error('JWT Login error:', error);
      throw error;
    }
  }

  // Logout
  logout() {
    this.clearAuth();
    console.log('JWT Logout successful');
  }

  // Clear authentication data
  private clearAuth() {
    this.token = null;
    this.user = null;
    this.tokenExpiry = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('jwt_user');
      localStorage.removeItem('jwt_expiry');
    }
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    if (!this.token) return false;
    return !this.isTokenExpired(this.token);
  }

  // Get token
  getToken(): string | null {
    return this.isAuthenticated() ? this.token : null;
  }

  // Get user
  getUser(): User | null {
    return this.isAuthenticated() ? this.user : null;
  }

  // Get token expiry
  getTokenExpiry(): number | null {
    return this.tokenExpiry;
  }

  // Check if token will expire soon (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    if (!this.tokenExpiry) return true;
    const fiveMinutesFromNow = Math.floor(Date.now() / 1000) + (5 * 60);
    return this.tokenExpiry < fiveMinutesFromNow;
  }

  // Refresh token (placeholder for future implementation)
  async refreshToken(): Promise<boolean> {
    try {
      // In production, this would call a refresh endpoint
      console.log('JWT Token refresh not implemented yet');
      return false;
    } catch (error) {
      console.error('JWT Token refresh failed:', error);
      return false;
    }
  }

  // Get authentication headers for API calls
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // User role checks
  isAdmin(): boolean {
    return this.user?.isAdmin || false;
  }

  isModerator(): boolean {
    return this.user?.isModerator || false;
  }

  isVerified(): boolean {
    return this.user?.isVerified || false;
  }
}

export const jwtAuthManager = JWTAuthManager.getInstance();
