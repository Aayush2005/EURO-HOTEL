'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  phone: string;
  status: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (loginData: { login: string; password: string }) => Promise<void>;
  register: (registerData: { email: string; username: string; password: string; phone: string }) => Promise<void>;
  verifyOTP: (otpData: { email: string; otp_code: string }) => Promise<void>;
  logout: () => Promise<void>;
  resetPasswordRequest: (email: string) => Promise<void>;
  resetPassword: (resetData: { email: string; otp_code: string; new_password: string }) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'An error occurred');
    }

    return response.json();
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await apiCall('/auth/me');
      setUser(data);
    } catch (error) {
      // Try to refresh token
      try {
        await refreshToken();
      } catch (refreshError) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (loginData: { login: string; password: string }) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    setUser(data.user);
  };

  const register = async (registerData: { email: string; username: string; password: string; phone: string }) => {
    await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
  };

  const verifyOTP = async (otpData: { email: string; otp_code: string }) => {
    const data = await apiCall('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Even if logout fails on server, clear local state
    }
    setUser(null);
  };

  const resetPasswordRequest = async (email: string) => {
    await apiCall('/auth/reset-password-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  };

  const resetPassword = async (resetData: { email: string; otp_code: string; new_password: string }) => {
    await apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });
  };

  const updateProfile = async (profileData: any) => {
    const data = await apiCall('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    setUser(data);
  };

  const refreshToken = async () => {
    const data = await apiCall('/auth/refresh', { method: 'POST' });
    setUser(data.user);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    verifyOTP,
    logout,
    resetPasswordRequest,
    resetPassword,
    updateProfile,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}