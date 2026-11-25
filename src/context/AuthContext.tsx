'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMe, logoutApi, googleLogin, adminLoginApi } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: 'customer' | 'admin';
  avatar?: string;
  savedAddresses?: any[];
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (redirectAfterLogin?: string) => void;
  closeAuthModal: () => void;
  signInWithGoogle: (credential: string) => Promise<any>;
  loginAsAdmin: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  pendingRedirect: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      const data = await getMe();
      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (_) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const openAuthModal = (redirectPath?: string) => {
    if (redirectPath) setPendingRedirect(redirectPath);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signInWithGoogle = async (credential: string) => {
    const data = await googleLogin(credential);
    if (data?.success && data?.user) {
      setUser(data.user);
      closeAuthModal();
      return data;
    }
    throw new Error(data?.message || 'Google authentication failed');
  };

  const loginAsAdmin = async (email: string, password: string) => {
    const data = await adminLoginApi(email, password);
    if (data?.success && data?.user) {
      setUser(data.user);
      return data;
    }
    throw new Error(data?.message || 'Admin authentication failed');
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        loginAsAdmin,
        logout,
        refreshUser,
        pendingRedirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
