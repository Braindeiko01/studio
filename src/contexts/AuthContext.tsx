
"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
// Importaciones de localStorage eliminadas
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void; // Aún actualiza solo estado local
  depositBalance: (amount: number) => void; // Aún actualiza solo estado local
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Llave de localStorage eliminada

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      // Ya no se carga el usuario desde localStorage
      setIsLoading(false); 
    }
  }, [hasMounted]);

  const login = (userData: User) => {
    setUser(userData);
    // Ya no se guarda en localStorage
  };

  const logout = () => {
    setUser(null);
    // Ya no se elimina de localStorage
    router.push('/login');
  };
  
  const updateUser = (updatedData: Partial<User>) => {
    // Esta función actualmente solo actualiza el estado del cliente.
    // Para persistir en el servidor, necesitaría llamar a un Server Action.
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      // Ya no se guarda en localStorage
    }
  };

  const depositBalance = (amount: number) => {
    // Esta función actualmente solo actualiza el estado del cliente.
    // Para persistir en el servidor, necesitaría llamar a un Server Action.
    if (user && amount > 0) {
      const newBalance = user.balance + amount;
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      // Ya no se guarda en localStorage
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
