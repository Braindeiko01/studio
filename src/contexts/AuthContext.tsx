
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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getLocalStorageItem<User>(AUTH_STORAGE_KEY);
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    // userData now includes the password, which is stored.
    // Verification happens in LoginPage before this function is called.
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
      // Ensure password is not accidentally wiped if not part of updatedData
      // but if it is, it means the user is changing it (though not implemented via this function)
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
