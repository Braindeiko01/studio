
"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getUserDataAction } from '@/lib/actions'; // Para intentar cargar datos del usuario si hay un ID guardado

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void; 
  refreshUser: () => Promise<void>; // Para actualizar datos del usuario desde el backend
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_ID_STORAGE_KEY = 'cr_duels_user_id'; // Guardaremos solo el ID del usuario

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
      const storedUserId = localStorage.getItem(USER_ID_STORAGE_KEY);
      if (storedUserId) {
        // Intenta cargar los datos completos del usuario desde el backend usando el ID
        getUserDataAction(storedUserId)
          .then(result => {
            if (result.user) {
              setUser(result.user);
            } else {
              // Si no se encuentra el usuario o hay error, limpiar el ID guardado
              localStorage.removeItem(USER_ID_STORAGE_KEY);
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
    if (userData.id) {
        localStorage.setItem(USER_ID_STORAGE_KEY, userData.id);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_ID_STORAGE_KEY);
    router.push('/login'); // Redirige al login
  };
  
  const updateUser = (updatedData: Partial<User>) => {
    // Esta función actualiza el estado local.
    // Para persistir en el servidor, el componente que llama a esto debería
    // invocar un Server Action y luego llamar a updateUser o refreshUser.
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
    }
  };

  const refreshUser = async () => {
    if (user?.id) {
      setIsLoading(true);
      try {
        const result = await getUserDataAction(user.id);
        if (result.user) {
          setUser(result.user);
        } else if (result.error) {
          console.error("Error refreshing user:", result.error);
          // Podrías decidir desloguear al usuario si hay un error crítico
          // logout(); 
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook useAuth no necesita cambios
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
