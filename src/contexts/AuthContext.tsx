
"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from '@/lib/storage';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  depositBalance: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'crDuelsUser';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Remains true for server render and initial client render
  const [hasMounted, setHasMounted] = useState(false); // To track client mount status
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true); // Set to true once component mounts on client
  }, []);

  useEffect(() => {
    if (hasMounted) { // Only run localStorage logic after component has mounted
      const storedUser = getLocalStorageItem<User>(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false); // Now set isLoading to false
    }
  }, [hasMounted]); // Depend on hasMounted

  const login = (userData: User) => {
    setUser(userData);
    setLocalStorageItem(AUTH_STORAGE_KEY, userData);
  };

  const logout = () => {
    setUser(null);
    removeLocalStorageItem(AUTH_STORAGE_KEY);
    router.push('/login');
  };
  
  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      setLocalStorageItem(AUTH_STORAGE_KEY, newUser);
    }
  };

  const depositBalance = (amount: number) => {
    if (user && amount > 0) {
      const newBalance = user.balance + amount;
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      setLocalStorageItem(AUTH_STORAGE_KEY, updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser, depositBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
