'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authManager, User } from './auth';

// React context for authentication
const AuthContext = createContext<{
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isVerified: boolean;
  loading: boolean;
} | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authManager.initialize();
    setUser(authManager.getCurrentUser());
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await authManager.login(email, password);
    setUser(authManager.getCurrentUser());
  };

  const register = async (userData: any) => {
    await authManager.register(userData);
  };

  const logout = () => {
    authManager.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: authManager.isAuthenticated(),
        isAdmin: authManager.isAdmin(),
        isModerator: authManager.isModerator(),
        isVerified: authManager.isVerified(),
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export function withAuth<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  options: { requireAdmin?: boolean; requireModerator?: boolean; requireVerified?: boolean } = {}
) {
  return function AuthenticatedComponent(props: T) {
    const { isAuthenticated, isAdmin, isModerator, isVerified } = useAuth();

    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }

    if (options.requireAdmin && !isAdmin) {
      return <div>Admin access required.</div>;
    }

    if (options.requireModerator && !isModerator) {
      return <div>Moderator access required.</div>;
    }

    if (options.requireVerified && !isVerified) {
      return <div>Verified account required.</div>;
    }

    return <Component {...props} />;
  };
}
