'use client';

import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { trackAdsConversion } from '@/lib/ads-conversions';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'user' | 'admin' | 'manager' | 'receptionist';
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  verifySignupOtp: (email: string, token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (profileData: { full_name: string | null; phone?: string | null }) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  authenticatedFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  };

  const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getAccessToken();
    const headers = new Headers(options.headers);
    headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(`${API_URL}${endpoint}`, { ...options, headers });
  };

  const parseApiResponse = async <T,>(response: Response): Promise<T> => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }
    return response.json();
  };

  const refreshUser = async () => {
    const token = await getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }
    const data = await parseApiResponse<{ user: User }>(await authenticatedFetch('/me'));
    setUser(data.user);
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await refreshUser();
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    bootstrap();

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        const result = await parseApiResponse<{ user: User }>(response);
        if (isMounted) setUser(result.user);
      } catch (err) {
        console.error('[Auth] Failed to sync user from /me:', err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
  };

  const verifySignupOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    if (error) throw new Error(error.message);
    // Google Ads enhanced conversion — completed sign-up
    trackAdsConversion('signup', { user: { email } });
  };

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (profileData: { full_name: string | null }) => {
    const data = await parseApiResponse<{ user: User }>(
      await authenticatedFetch('/me', {
        method: 'PATCH',
        body: JSON.stringify(profileData),
      }),
    );
    setUser(data.user);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      signIn,
      signUp,
      verifySignupOtp,
      forgotPassword,
      logout,
      refreshUser,
      updateProfile,
      getAccessToken,
      authenticatedFetch,
    }),
    [user, isLoading, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
