
'use server';

import type {
  User,
  RegisterData,
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

// Simulación de base de datos en memoria del servidor (para funciones no migradas o como fallback)
let usersInServerMemoryDb: User[] = [];

// URL del Backend. Asegúrate de que esta URL sea la correcta para tu instancia de Railway.
// Configura la variable de entorno BACKEND_API_URL en Railway.
const BACKEND_URL = process.env.BACKEND_API_URL || 'https://crduels-crduelsproduction.up.railway.app';


export async function registerUserAction(
  data: RegisterData
): Promise<{ user: User | null; error: string | null }> {
  const backendPayload: Omit<BackendUsuarioDto, 'id' | 'saldo' | 'reputacion'> = {
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
      return { user: null, error: errorData.message || `Error ${response.status} al registrar usuario.` };
    }

    const registeredBackendUser = await response.json() as BackendUsuarioDto;

    if (!registeredBackendUser.id) {
        return { user: null, error: "El backend no devolvió un ID para el usuario registrado." };
    }

    const appUser: User = {
      id: registeredBackendUser.id, // ID del backend
      googleId: data.googleId, // Guardamos el googleId original
      username: registeredBackendUser.nombre,
      email: registeredBackendUser.email,
      phone: registeredBackendUser.telefono,
      clashTag: registeredBackendUser.tagClash,
      nequiAccount: registeredBackendUser.telefono, // Asumimos que Nequi es el mismo teléfono
      balance: registeredBackendUser.saldo ?? 0,
      friendLink: registeredBackendUser.linkAmistad,
      avatarUrl: data.avatarUrl || `https://placehold.co/100x100.png?text=${registeredBackendUser.nombre[0]?.toUpperCase() || 'U'}`,
      reputacion: registeredBackendUser.reputacion ?? 0,
    };
    
    // Opcional: guardar en memoria local si es necesario para funciones no migradas
    // usersInServerMemoryDb.push(appUser); 

    return { user: appUser, error: null };

  } catch (error: any) {
    console.error("Error en registerUserAction:", error);
    return { user: null, error: error.message || "Ocurrió un error de red al intentar registrar." };
  }
}


export async function loginWithGoogleAction(
  googleData: GoogleAuthValues
): Promise<{ user: User | null; error: string | null; needsProfileCompletion?: boolean }> {
  // LIMITACIÓN DE LA API:
  // La API actual no tiene un endpoint para buscar/obtener un usuario por googleId o email.
  // Solo se puede obtener un usuario por el ID que el backend genera (GET /api/usuarios/{id}).
  // Por lo tanto, este "login" no puede verificar si el usuario ya existe en el backend
  // basándose únicamente en el googleId.
  //
  // Flujo actual:
  // 1. Siempre se asume que el usuario podría ser nuevo o necesitar completar el perfil.
  // 2. Se devuelven los datos de Google para que el frontend inicie el "paso 2" del registro.
  // 3. Si el usuario ya existe (detectado por el backend durante el `registerUserAction` por email/teléfono único),
  //    el backend debería devolver un error en ese punto, o manejar la situación de "ya existe".

  // console.log('loginWithGoogleAction: Intentando simular login/registro para googleId:', googleData.googleId);

  // Devolvemos los datos de Google para que el frontend proceda a completar el perfil.
  // El `registerUserAction` se encargará de la creación real en el backend.
  const partialUserForProfileCompletion: User = {
      id: '', // El ID real vendrá del backend después del registro completo
      googleId: googleData.googleId,
      username: googleData.username,
      email: googleData.email,
      avatarUrl: googleData.avatarUrl,
      phone: '',
      clashTag: '',
      nequiAccount: '',
      balance: 0,
      friendLink: '',
      reputacion: 0,
  };
  return { user: partialUserForProfileCompletion, error: null, needsProfileCompletion: true };
}

export async function getUserDataAction(userId: string): Promise<{ user: User | null; error: string | null }> {
  // userId aquí es el ID generado por el backend (UUID)
  try {
    const response = await fetch(`${BACKEND_URL}/api/usuarios/${userId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return { user: null, error: 'Usuario no encontrado en el backend.' };
      }
      const errorData = await response.json().catch(() => ({ message: `Error del servidor: ${response.status}` }));
      return { user: null, error: errorData.message || `Error ${response.status} al obtener datos del usuario.` };
    }
    const backendUser = await response.json() as BackendUsuarioDto;

    if (!backendUser.id) {
        // Esto no debería pasar si el backend devuelve un usuario válido con ID
        return { user: null, error: "El backend devolvió datos de usuario incompletos (sin ID)." };
    }

    const appUser: User = {
      id: backendUser.id, // ID del backend
      // googleId: ?? Si no lo guardamos en el backend, no podemos recuperarlo aquí directamente.
      // Se podría guardar en localStorage junto con el id del backend tras el registro.
      username: backendUser.nombre,
      email: backendUser.email,
      phone: backendUser.telefono,
      clashTag: backendUser.tagClash,
      nequiAccount: backendUser.telefono,
      balance: backendUser.saldo ?? 0,
      friendLink: backendUser.linkAmistad,
      avatarUrl: `https://placehold.co/100x100.png?text=${backendUser.nombre[0]?.toUpperCase() || 'U'}`, // Considerar si el avatar se guarda/devuelve
      reputacion: backendUser.reputacion ?? 0,
    };
    return { user: appUser, error: null };

  } catch (error: any) {
    console.error("Error en getUserDataAction:", error);
    return { user: null, error: error.message || "Ocurrió un error de red al obtener datos del usuario." };
  }
}

// LIMITACIÓN DE LA API: No hay endpoint para actualizar el perfil del usuario.
// Esta función seguirá usando la base de datos en memoria para simular la actualización.
export async function updateUserProfileInMemoryAction(
  userId: string, // Este es el ID del backend
  updatedData: Partial<User>
): Promise<{ user: User | null; error: string | null }> {
  
  console.warn("updateUserProfileInMemoryAction: La API actual no permite actualizar perfiles de usuario en el backend. Esta actualización es solo local (en memoria del AuthContext).");

  // Intentamos encontrar y actualizar en la BD en memoria si el usuario existe allí (improbable si todo es vía backend)
  const userIndex = usersInServerMemoryDb.findIndex(u => u.id === userId);

  if (userIndex !== -1) {
    usersInServerMemoryDb[userIndex] = { ...usersInServerMemoryDb[userIndex], ...updatedData };
    if (updatedData.nequiAccount) usersInServerMemoryDb[userIndex].phone = updatedData.nequiAccount;
    if (updatedData.phone) usersInServerMemoryDb[userIndex].nequiAccount = updatedData.phone;
    return { user: usersInServerMemoryDb[userIndex], error: null };
  }
  
  // Si no está en la BD en memoria, no podemos hacer mucho más que devolver un error o los datos sin cambios.
  // Lo ideal sería que el AuthContext maneje la actualización optimista y el refreshUser obtenga los datos del backend.
  // Como el backend no actualiza, esta función es principalmente para la simulación.
  return { user: null, error: 'Usuario no encontrado en la base de datos en memoria para actualizar (esta función es simulada).' };
}


// --- Acciones de Transacciones, Apuestas, Partidas (A implementar con backend) ---

export async function requestTransactionAction(
  userId: string, // Backend User ID
  amount: number,
  type: "DEPOSITO" | "RETIRO"
): Promise<{ transaction: BackendTransaccionResponseDto | null; error: string | null }> {
  const payload: BackendTransaccionRequestDto = {
    usuarioId: userId,
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
      const errorData = await response.json().catch(() => ({}));
      return { transaction: null, error: errorData.message || `Error ${response.status}` };
    }
    const transaction = await response.json();
    return { transaction, error: null };
  } catch (error: any) {
    return { transaction: null, error: error.message || "Error de red" };
  }
}

export async function createBetAction(
  userId: string, // Backend User ID
  amount: number,
  gameMode: string
): Promise<{ bet: BackendApuestaResponseDto | null; error: string | null }> {
  const payload: BackendApuestaRequestDto = {
    jugador1Id: userId,
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
      const errorData = await response.json().catch(() => ({}));
      return { bet: null, error: errorData.message || `Error ${response.status}` };
    }
    const bet = await response.json();
    return { bet, error: null };
  } catch (error: any) {
    return { bet: null, error: error.message || "Error de red" };
  }
}

export async function getUserTransactionsAction(
  userId: string // Backend User ID
): Promise<{ transactions: BackendTransaccionResponseDto[] | null; error: string | null }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/transacciones/usuario/${userId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { transactions: null, error: errorData.message || `Error ${response.status}` };
    }
    const transactions = await response.json();
    return { transactions, error: null };
  } catch (error: any) {
    return { transactions: null, error: error.message || "Error de red" };
  }
}
