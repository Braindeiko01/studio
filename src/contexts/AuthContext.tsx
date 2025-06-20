
"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getUserDataAction, updateUserProfileInMemoryAction } from '@/lib/actions';

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

// USER_ID_STORAGE_KEY ahora almacenará el googleId (que es User.id en el frontend)
const USER_ID_STORAGE_KEY = 'cr_duels_user_id'; 

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
      const storedUserId = localStorage.getItem(USER_ID_STORAGE_KEY); // Este es el googleId

      if (storedUserId) {
        setIsLoading(true);
        getUserDataAction(storedUserId) // Se llama con el googleId
          .then(result => {
            if (result.user) {
              // getUserDataAction devuelve User donde User.id ya es el googleId
              setUser({ 
                ...result.user, 
                // Asegurar que el avatarUrl local se mantenga si el backend no lo devuelve o es el placeholder
                avatarUrl: result.user.avatarUrl?.includes('placehold.co') && user?.avatarUrl ? user.avatarUrl : result.user.avatarUrl,
              });
            } else {
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
    // userData.id es el googleId
    setUser(userData);
    if (userData.id) { 
        localStorage.setItem(USER_ID_STORAGE_KEY, userData.id);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_ID_STORAGE_KEY);
    router.push('/login');
  };
  
  const updateUser = async (updatedData: Partial<User>): Promise<{ success: boolean; error?: string | null }> => {
    if (!user || !user.id ) { // user.id es googleId
      return { success: false, error: "Usuario no autenticado." };
    }
    
    const optimisticUser = { ...user, ...updatedData } as User; 
    setUser(optimisticUser);

    // La API actual (según la especificación OpenAPI) NO tiene un endpoint para actualizar 
    // el perfil de un usuario. La función `updateUserProfileInMemoryAction` es una simulación.
    // Los cambios NO se persistirán en el backend hasta que se implemente dicho endpoint.
    const simulationResult = await updateUserProfileInMemoryAction(user.id, updatedData); // user.id es googleId
    
    if (simulationResult.user) {
       // La actualización optimista ya ocurrió. `setUser` se llamaría de nuevo si el backend devuelve datos diferentes.
       // Como es simulación, el estado ya está actualizado.
       return { success: true };
    } else {
       await refreshUser(); 
       return { success: false, error: simulationResult.error || "Error simulando actualización." };
    }
  };

  const refreshUser = async () => {
    const storedUserId = localStorage.getItem(USER_ID_STORAGE_KEY); // googleId

    if (storedUserId) {
      setIsLoading(true);
      try {
        const result = await getUserDataAction(storedUserId); // Usar googleId para la llamada
        if (result.user) {
          setUser({ 
            ...result.user,
            // Asegurar que el avatarUrl local se mantenga si el backend no lo devuelve o es el placeholder
            avatarUrl: result.user.avatarUrl?.includes('placehold.co') && user?.avatarUrl ? user.avatarUrl : result.user.avatarUrl,
          });
        } else if (result.error) {
          console.error("Error refreshing user:", result.error);
          logout(); 
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    } else {
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
