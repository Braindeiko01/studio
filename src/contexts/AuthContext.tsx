
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
// USER_ID_STORAGE_KEY ahora almacenará el ID del usuario del backend (UUID)
const USER_ID_STORAGE_KEY = 'cr_duels_backend_user_id'; 
const GOOGLE_ID_STORAGE_KEY = 'cr_duels_google_id'; // Para guardar el googleId por si se necesita

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
      const storedUserId = localStorage.getItem(USER_ID_STORAGE_KEY); // Este es el ID del backend (UUID)
      if (storedUserId) {
        setIsLoading(true);
        getUserDataAction(storedUserId) // Se llama con el ID del backend
          .then(result => {
            if (result.user) {
              // Si necesitamos el googleId y no viene del backend, intentamos cargarlo de localStorage
              const storedGoogleId = localStorage.getItem(GOOGLE_ID_STORAGE_KEY);
              // Aseguramos que el usuario tenga el googleId si está disponible.
              // Nota: getUserDataAction podría ser mejorado para devolver el googleId si el backend lo almacena.
              setUser({ ...result.user, googleId: result.user.googleId || storedGoogleId || undefined });
            } else {
              // Si no se encuentra el usuario en el backend, limpiamos localStorage
              localStorage.removeItem(USER_ID_STORAGE_KEY);
              localStorage.removeItem(GOOGLE_ID_STORAGE_KEY);
            }
          })
          .catch(error => {
            console.error("Error fetching user data on mount:", error);
            localStorage.removeItem(USER_ID_STORAGE_KEY);
            localStorage.removeItem(GOOGLE_ID_STORAGE_KEY);
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
    if (userData.id) { // userData.id es el ID del backend (UUID)
        localStorage.setItem(USER_ID_STORAGE_KEY, userData.id);
    }
    if (userData.googleId) { // Guardar googleId si está disponible
        localStorage.setItem(GOOGLE_ID_STORAGE_KEY, userData.googleId);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_ID_STORAGE_KEY);
    localStorage.removeItem(GOOGLE_ID_STORAGE_KEY);
    router.push('/login');
  };
  
  const updateUser = async (updatedData: Partial<User>): Promise<{ success: boolean; error?: string | null }> => {
    if (!user || !user.id) { // user.id es el ID del backend (UUID)
      return { success: false, error: "Usuario no autenticado." };
    }
    
    // Actualización optimista en el frontend
    const optimisticUser = { ...user, ...updatedData } as User; 
    setUser(optimisticUser);

    // ** NOTA IMPORTANTE SOBRE LA API DEL BACKEND **
    // La API actual (según la especificación OpenAPI) NO tiene un endpoint para actualizar 
    // el perfil de un usuario. La función `updateUserProfileInMemoryAction` es una simulación.
    // Los cambios NO se persistirán en el backend hasta que se implemente dicho endpoint.
    const simulationResult = await updateUserProfileInMemoryAction(user.id, updatedData);
    
    if (simulationResult.user) {
       // console.warn("Perfil actualizado solo en memoria del frontend debido a limitación de API.");
       // La actualización optimista ya ocurrió. Si la simulación/backend devolviera datos distintos,
       // aquí se podría re-sincronizar: setUser(simulationResult.user);
       return { success: true };
    } else {
       // Revertir si la simulación fallara o si hubiera una llamada real fallida
       await refreshUser(); // Vuelve a cargar los datos del "backend" (o estado anterior)
       return { success: false, error: simulationResult.error || "Error simulando actualización." };
    }
  };

  const refreshUser = async () => {
    const storedUserId = localStorage.getItem(USER_ID_STORAGE_KEY); // ID del backend (UUID)
    if (storedUserId) {
      setIsLoading(true);
      try {
        const result = await getUserDataAction(storedUserId);
        if (result.user) {
          const storedGoogleId = localStorage.getItem(GOOGLE_ID_STORAGE_KEY);
          setUser({ ...result.user, googleId: result.user.googleId || storedGoogleId || undefined });
        } else if (result.error) {
          console.error("Error refreshing user:", result.error);
          logout(); 
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error);
        logout(); // Desloguear en caso de error de red grave
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
