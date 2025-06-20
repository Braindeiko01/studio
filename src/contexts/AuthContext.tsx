
"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getUserDataAction, updateUserProfileInMemoryAction } from '@/lib/actions'; // updateUserProfileInMemoryAction es nueva

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => Promise<{ success: boolean; error?: string | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_ID_STORAGE_KEY = 'cr_duels_google_user_id'; // Guardaremos el googleId

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
      const storedUserId = localStorage.getItem(USER_ID_STORAGE_KEY); // storedUserId es googleId
      if (storedUserId) {
        setIsLoading(true);
        getUserDataAction(storedUserId)
          .then(result => {
            if (result.user) {
              setUser(result.user);
            } else {
              localStorage.removeItem(USER_ID_STORAGE_KEY); // Limpiar si no se encuentra o hay error
            }
          })
          .catch(error => {
            console.error("Error fetching user data on mount:", error);
            localStorage.removeItem(USER_ID_STORAGE_KEY);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }
  }, [hasMounted]);

  const login = (userData: User) => {
    setUser(userData);
    if (userData.id) { // userData.id es googleId
        localStorage.setItem(USER_ID_STORAGE_KEY, userData.id);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_ID_STORAGE_KEY);
    router.push('/login');
  };
  
  const updateUser = async (updatedData: Partial<User>): Promise<{ success: boolean; error?: string | null }> => {
    if (user?.id) { // user.id es googleId
      // Actualiza el estado local inmediatamente para una UI responsiva
      const optimisticUser = { ...user, ...updatedData };
      setUser(optimisticUser);

      // Llama al Server Action para actualizar en el "backend" (memoria)
      // En un backend real, aquí llamarías al endpoint de actualización del perfil.
      const result = await updateUserProfileInMemoryAction(user.id, updatedData);
      if (result.user) {
        setUser(result.user); // Re-sincroniza con la respuesta del backend
        return { success: true };
      } else {
        // Si falla, revierte al estado anterior del usuario
        await refreshUser(); // O podrías guardar el estado anterior y revertirlo.
        return { success: false, error: result.error };
      }
    }
    return { success: false, error: "Usuario no autenticado." };
  };

  const refreshUser = async () => {
    const storedUserId = localStorage.getItem(USER_ID_STORAGE_KEY);
    if (storedUserId) {
      setIsLoading(true);
      try {
        const result = await getUserDataAction(storedUserId);
        if (result.user) {
          setUser(result.user);
        } else if (result.error) {
          console.error("Error refreshing user:", result.error);
          // Si el usuario ya no existe en el backend, desloguear
          logout();
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Si no hay ID guardado, asegurarse de que el usuario esté deslogueado
      if (user) setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser, refreshUser }}>
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

    