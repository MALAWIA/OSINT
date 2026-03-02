import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface LoginFormData {
  email: string;
  password: string;
  unique_identification_code: string;
}

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  full_name: string;
}

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_active?: boolean;
  date_joined?: string;
}

interface AuthResponse {
  message: string;
  user?: UserProfile;
  token?: string;
  error?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (formData: LoginFormData) => Promise<AuthResponse>;
  signup: (formData: Omit<SignupFormData, 'confirmPassword'>) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  getCurrentUser: () => UserProfile | null;
  refreshToken: () => Promise<boolean>;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize auth state on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('access_token');
        localStorage.removeItem('userData');
        delete axios.defaults.headers.common['Authorization'];
      }
    }
  }, []);

  // Login function
  const login = async (formData: LoginFormData): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { user: userData, access, refresh } = response.data;

      if (userData && access && refresh) {
        // Store token and user data
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        // Update state
        setUser(userData);
        setError(null);

        return {
          message: 'Login successful',
          user: userData,
          token: access,
        };
      } else {
        const errorMessage = response.data?.error || 'Login failed';
        setError(errorMessage);
        return {
          message: 'Login failed',
          error: errorMessage,
        };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      return {
        message: 'Login failed',
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  
  // Signup function
  const signup = async (formData: Omit<SignupFormData, 'confirmPassword'>): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register/`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { user: userData } = response.data;

      if (userData) {
        // For signup, don't auto-login, just show success
        setError(null);

        return {
          message: `Registration successful! Your unique identification code is: ${userData.unique_identification_code || 'Check your email'}. Please save this code securely as you'll need it for login.`,
          user: userData,
        };
      } else {
        const errorMessage = response.data?.detail || 'Registration failed';
        setError(errorMessage);
        return {
          message: 'Registration failed',
          error: errorMessage,
        };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Registration failed';
      setError(errorMessage);
      return {
        message: 'Registration failed',
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Call backend logout endpoint if available
      const token = localStorage.getItem('access_token');
      if (token) {
        await axios.post(
          `${API_BASE_URL}/auth/logout/`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
      }
    } catch (err) {
      // Continue with logout even if backend call fails
      console.error('Logout error:', err);
    } finally {
      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userData');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('userEmail');
      
      // Clear axios header
      delete axios.defaults.headers.common['Authorization'];
      
      // Update state
      setUser(null);
      setError(null);
      setIsLoading(false);
      
      // Navigate to login
      navigate('/login');
    }
  };

  // Get current user
  const getCurrentUser = (): UserProfile | null => {
    return user;
  };

  // Refresh token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return false;
      }

      const response = await axios.post(
        `${API_BASE_URL}/users/refresh-token/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const { token: newToken } = response.data;
      if (newToken) {
        localStorage.setItem('authToken', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return true;
      }
      return false;
    } catch (err) {
      console.error('Token refresh failed:', err);
      return false;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user && !!localStorage.getItem('access_token');

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    isAuthenticated,
    getCurrentUser,
    refreshToken,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
