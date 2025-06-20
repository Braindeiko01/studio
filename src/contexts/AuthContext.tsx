
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
// BACKEND_ID_STORAGE_KEY almacenará el UUID generado por el backend
const BACKEND_ID_STORAGE_KEY = 'cr_duels_backend_user_id';

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
      const storedBackendId = localStorage.getItem(BACKEND_ID_STORAGE_KEY); // Este es el UUID del backend

      if (storedUserId && storedBackendId) {
        setIsLoading(true);
        getUserDataAction(storedBackendId) // Se llama con el ID del backend (UUID)
          .then(result => {
            if (result.user) {
              // getUserDataAction devuelve User con backendId. Le asignamos el googleId (User.id)
              // y preservamos el avatarUrl que podría estar ya en el estado local si se actualizó recientemente.
              setUser({ 
                ...result.user, 
                id: storedUserId, // Asignar el googleId almacenado
                avatarUrl: result.user.avatarUrl || user?.avatarUrl // Mantener avatar si existe
              });
            } else {
              // Si no se encuentra el usuario en el backend (o hay error), limpiar localStorage
              localStorage.removeItem(USER_ID_STORAGE_KEY);
              localStorage.removeItem(BACKEND_ID_STORAGE_KEY);
            }
          })
          .catch(error => {
            console.error("Error fetching user data on mount:", error);
            localStorage.removeItem(USER_ID_STORAGE_KEY);
            localStorage.removeItem(BACKEND_ID_STORAGE_KEY);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }
  }, [hasMounted]); // Removí 'user' de las dependencias para evitar bucles si avatarUrl cambia.

  const login = (userData: User) => {
    // userData.id es el googleId
    // userData.backendId es el UUID del backend
    setUser(userData);
    if (userData.id) { 
        localStorage.setItem(USER_ID_STORAGE_KEY, userData.id);
    }
    if (userData.backendId) { 
        localStorage.setItem(BACKEND_ID_STORAGE_KEY, userData.backendId);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_ID_STORAGE_KEY);
    localStorage.removeItem(BACKEND_ID_STORAGE_KEY);
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
       // La actualización optimista ya ocurrió.
       return { success: true };
    } else {
       await refreshUser(); 
       return { success: false, error: simulationResult.error || "Error simulando actualización." };
    }
  };

  const refreshUser = async () => {
    const storedUserId = localStorage.getItem(USER_ID_STORAGE_KEY); // googleId
    const storedBackendId = localStorage.getItem(BACKEND_ID_STORAGE_KEY); // backend UUID

    if (storedUserId && storedBackendId) {
      setIsLoading(true);
      try {
        const result = await getUserDataAction(storedBackendId); // Usar backendId para la llamada
        if (result.user) {
          setUser({ 
            ...result.user, 
            id: storedUserId, // Asegurar que User.id (googleId) esté presente
            backendId: storedBackendId, // Asegurar que User.backendId esté presente
            avatarUrl: result.user.avatarUrl || user?.avatarUrl // Mantener avatar si existe
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
