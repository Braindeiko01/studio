
'use server';

import type {
  User,
  RegisterWithGoogleData,
  GoogleAuthValues,
  BackendUsuarioDto,
  BackendTransaccionRequestDto,
  BackendTransaccionResponseDto,
  BackendApuestaRequestDto,
  BackendApuestaResponseDto,
  BackendPartidaRequestDto,
  BackendPartidaResponseDto,
  BackendMatchResultDto,
} from '@/types';

// URL del Backend. Se usa la variable de entorno o la URL de producción de Railway por defecto.
const BACKEND_URL = process.env.BACKEND_API_URL || 'https://crduels-crduelsproduction.up.railway.app';

export async function registerUserAction(
  data: RegisterWithGoogleData
): Promise<{ user: User | null; error: string | null }> {
  
  // El DTO del backend para el registro no incluye un campo 'id'.
  // El backend generará su propio ID (UUID).
  const backendPayload: Omit<BackendUsuarioDto, 'id' | 'saldo' | 'reputacion' | 'linkAmistad'> & { linkAmistad?: string } = {
    nombre: data.username,
    email: data.email,
    telefono: data.phone,
    tagClash: data.clashTag,
    linkAmistad: data.friendLink,
  };

  try {
    const response = await fetch(`${BACKEND_URL}/api/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error del servidor: ${response.status}` }));
      if (errorData && errorData.message) {
        return { user: null, error: errorData.message };
      }
      return { user: null, error: `Error ${response.status} al registrar usuario. ${errorData.details || ''}`.trim() };
    }

    const registeredBackendUser = await response.json() as BackendUsuarioDto;

    if (!registeredBackendUser.id) {
        return { user: null, error: "El backend no devolvió un ID para el usuario registrado." };
    }

    const appUser: User = {
      id: data.googleId, // El ID del frontend es el googleId
      backendId: registeredBackendUser.id, // El ID generado por el backend
      username: registeredBackendUser.nombre,
      email: registeredBackendUser.email,
      phone: registeredBackendUser.telefono,
      clashTag: registeredBackendUser.tagClash,
      nequiAccount: registeredBackendUser.telefono,
      balance: registeredBackendUser.saldo ?? 0,
      friendLink: registeredBackendUser.linkAmistad || '',
      avatarUrl: data.avatarUrl || `https://placehold.co/100x100.png?text=${registeredBackendUser.nombre[0]?.toUpperCase() || 'U'}`,
      reputacion: registeredBackendUser.reputacion ?? 0,
    };
    
    return { user: appUser, error: null };

  } catch (error: any) {
    console.error("Error en registerUserAction:", error);
    return { user: null, error: error.message || "Ocurrió un error de red al intentar registrar." };
  }
}


export async function loginWithGoogleAction(
  googleAuthData: GoogleAuthValues
): Promise<{ user: Partial<User> | null; error: string | null; needsProfileCompletion?: boolean }> {
  // Este action ahora principalmente prepara datos para el flujo de registro si el usuario es nuevo,
  // o devuelve los datos de Google para que AuthContext intente cargar la sesión completa.
  // La API actual no permite buscar/loguear un usuario por googleId directamente en el backend.
  
  const partialUserForFrontend: Partial<User> = {
      id: googleAuthData.googleId, // User.id es googleId
      username: googleAuthData.username,
      email: googleAuthData.email,
      avatarUrl: googleAuthData.avatarUrl,
      // backendId, phone, clashTag, etc., se obtendrán después del registro completo o al cargar sesión.
  };
  // Siempre se necesitará completar perfil o cargar datos si ya está registrado.
  // AuthContext se encargará de llamar a getUserDataAction si hay un backendId en localStorage.
  return { user: partialUserForFrontend, error: null, needsProfileCompletion: true };
}

// El parámetro `backendUuid` aquí es el ID generado por el backend (UUID)
export async function getUserDataAction(backendUuid: string): Promise<{ user: User | null; error: string | null }> {
  if (!backendUuid) {
    return { user: null, error: 'Se requiere el ID del backend para obtener datos del usuario.' };
  }
  try {
    const response = await fetch(`${BACKEND_URL}/api/usuarios/${backendUuid}`);
    if (!response.ok) {
      if (response.status === 404) {
        return { user: null, error: 'Usuario no encontrado en el backend.' };
      }
      const errorData = await response.json().catch(() => ({ message: `Error del servidor: ${response.status}` }));
      return { user: null, error: errorData.message || `Error ${response.status} al obtener datos del usuario.` };
    }
    const backendUser = await response.json() as BackendUsuarioDto;

    if (!backendUser.id) {
        return { user: null, error: "El backend devolvió datos de usuario incompletos (sin ID)." };
    }

    // Nota: `backendUser.id` es el UUID del backend.
    // El `googleId` (que será `User.id` en el frontend) debe ser proporcionado por el AuthContext
    // al reconstruir el objeto User completo después de esta llamada.
    const appUser: User = {
      id: '', // Este se llenará con el googleId desde AuthContext o la sesión
      backendId: backendUser.id,
      username: backendUser.nombre,
      email: backendUser.email,
      phone: backendUser.telefono,
      clashTag: backendUser.tagClash,
      nequiAccount: backendUser.telefono,
      balance: backendUser.saldo ?? 0,
      friendLink: backendUser.linkAmistad || '',
      avatarUrl: `https://placehold.co/100x100.png?text=${backendUser.nombre[0]?.toUpperCase() || 'U'}`,
      reputacion: backendUser.reputacion ?? 0,
    };
    return { user: appUser, error: null };

  } catch (error: any) {
    console.error("Error en getUserDataAction:", error);
    return { user: null, error: error.message || "Ocurrió un error de red al obtener datos del usuario." };
  }
}

// `userId` aquí es el `googleId`. La actualización del perfil en backend no está implementada.
export async function updateUserProfileInMemoryAction(
  userId: string, // Este es el googleId (User.id del frontend)
  updatedData: Partial<User>
): Promise<{ user: User | null; error: string | null }> {
  // Esta función sigue siendo solo para simulación en memoria del frontend,
  // ya que la API no tiene un endpoint PUT /api/usuarios/{backend_uuid}
  console.warn("updateUserProfileInMemoryAction: Actualización de perfil simulada. Los cambios NO se guardan en el backend debido a la falta de un endpoint en la API.");
  
  // Se asume que AuthContext maneja la actualización optimista de su estado 'user'.
  // Esta función devuelve los datos actualizados para mantener la consistencia si AuthContext la llama.
  return { user: updatedData as User, error: null }; 
}


export async function requestTransactionAction(
  userBackendId: string, // Se necesita el Backend User ID (UUID)
  amount: number,
  type: "DEPOSITO" | "RETIRO"
): Promise<{ transaction: BackendTransaccionResponseDto | null; error: string | null }> {
  const payload: BackendTransaccionRequestDto = {
    usuarioId: userBackendId,
    monto: amount,
    tipo: type,
  };
  try {
    const response = await fetch(`${BACKEND_URL}/api/transacciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error del servidor: ${response.status}` }));
      return { transaction: null, error: errorData.message || `Error ${response.status} al crear transacción.` };
    }
    const transaction = await response.json() as BackendTransaccionResponseDto;
    return { transaction, error: null };
  } catch (error: any) {
    console.error("Error en requestTransactionAction:", error);
    return { transaction: null, error: error.message || "Error de red al crear transacción." };
  }
}

export async function createBetAction(
  userBackendId: string, // Se necesita el Backend User ID (UUID)
  amount: number,
  gameMode: string
): Promise<{ bet: BackendApuestaResponseDto | null; error: string | null }> {
  const payload: BackendApuestaRequestDto = {
    jugador1Id: userBackendId,
    monto: amount,
    modoJuego: gameMode,
  };
   try {
    const response = await fetch(`${BACKEND_URL}/api/apuestas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error del servidor: ${response.status}` }));
      return { bet: null, error: errorData.message || `Error ${response.status} al crear apuesta.` };
    }
    const bet = await response.json() as BackendApuestaResponseDto;
    return { bet, error: null };
  } catch (error: any) {
    console.error("Error en createBetAction:", error);
    return { bet: null, error: error.message || "Error de red al crear apuesta." };
  }
}

export async function getUserTransactionsAction(
  userBackendId: string // Se necesita el Backend User ID (UUID)
): Promise<{ transactions: BackendTransaccionResponseDto[] | null; error: string | null }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/transacciones/usuario/${userBackendId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error del servidor: ${response.status}` }));
      return { transactions: null, error: errorData.message || `Error ${response.status} al obtener transacciones.` };
    }
    const transactions = await response.json() as BackendTransaccionResponseDto[];
    return { transactions, error: null };
  } catch (error: any) {
    console.error("Error en getUserTransactionsAction:", error);
    return { transactions: null, error: error.message || "Error de red al obtener transacciones." };
  }
}
