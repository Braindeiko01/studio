
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
//const BACKEND_URL = process.env.BACKEND_API_URL || 'https://crduels-crduelsproduction.up.railway.app';
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';


export async function registerUserAction(
  data: RegisterWithGoogleData
): Promise<{ user: User | null; error: string | null }> {

  const backendPayload: BackendUsuarioDto = {
    id: data.googleId,
    nombre: data.username,
    email: data.email,
    telefono: data.phone,
    linkAmistad: data.friendLink,
  };

  console.log("id google: " + data.googleId)
  try {
    const response = await fetch(`${BACKEND_URL}/api/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
    });

    const registeredBackendUser = await response.json() as BackendUsuarioDto;

    // Asumimos que el backend devuelve el mismo 'id' (googleId) que se envió.
    if (!registeredBackendUser.id) {
      return { user: null, error: "El backend no devolvió un ID para el usuario registrado." };
    }

    const appUser: User = {
      id: registeredBackendUser.id, // Este ES el googleId
      username: registeredBackendUser.nombre,
      email: registeredBackendUser.email,
      phone: registeredBackendUser.telefono,
      clashTag: registeredBackendUser.tagClash,
      nequiAccount: registeredBackendUser.telefono, // Asumimos que Nequi es el mismo teléfono
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
): Promise<{ user: User | null; error: string | null; needsProfileCompletion?: boolean }> {

  // Intenta obtener el usuario del backend usando el googleId
  const existingUserResult = await getUserDataAction(googleAuthData.googleId);

  if (existingUserResult.user) {
    // El usuario ya existe en el backend
    return { user: existingUserResult.user, error: null, needsProfileCompletion: false };
  } else {
    // El usuario no existe en el backend (o hubo un error al obtenerlo que no sea 404).
    // Se asume que es un nuevo usuario y necesita completar el perfil.
    return { user: null, error: null, needsProfileCompletion: true };
  }
}

// El parámetro `userId` aquí es el `googleId`
export async function getUserDataAction(userId: string): Promise<{ user: User | null; error: string | null }> {
  if (!userId) {
    return { user: null, error: 'Se requiere el googleId para obtener datos del usuario.' };
  }
  try {
    const response = await fetch(`${BACKEND_URL}/api/usuarios/${userId}`); // {id} es googleId
    if (!response.ok) {
      if (response.status === 404) {
        return { user: null, error: 'Usuario no encontrado en el backend.' };
      }
      const errorData = await response.json().catch(() => ({ message: `Error del servidor: ${response.status}` }));
      return { user: null, error: errorData.message || `Error ${response.status} al obtener datos del usuario.` };
    }
    const backendUser = await response.json() as BackendUsuarioDto;

    // Asumimos que backendUser.id es el googleId
    if (!backendUser.id) {
      return { user: null, error: "El backend devolvió datos de usuario incompletos (sin ID)." };
    }

    const appUser: User = {
      id: backendUser.id, // Este es el googleId
      username: backendUser.nombre,
      email: backendUser.email,
      phone: backendUser.telefono,
      clashTag: backendUser.tagClash,
      nequiAccount: backendUser.telefono,
      balance: backendUser.saldo ?? 0,
      friendLink: backendUser.linkAmistad || '',
      // Asumimos que el avatarUrl lo gestiona el frontend o se podría añadir al BackendUsuarioDto si el backend lo gestionara
      avatarUrl: `https://placehold.co/100x100.png?text=${backendUser.nombre[0]?.toUpperCase() || 'U'}`,
      reputacion: backendUser.reputacion ?? 0,
    };
    return { user: appUser, error: null };

  } catch (error: any) {
    console.error("Error en getUserDataAction:", error);
    return { user: null, error: error.message || "Ocurrió un error de red al obtener datos del usuario." };
  }
}

// userId aquí es el googleId.
// IMPORTANTE: Esta función sigue siendo solo para simulación en memoria del frontend,
// ya que la API de OpenAPI NO tiene un endpoint PUT /api/usuarios/{id} para actualizar.
// Si tu backend ya tiene este endpoint, se necesitaría su definición para integrarlo.
export async function updateUserProfileInMemoryAction(
  userId: string, // Este es el googleId (User.id del frontend)
  updatedData: Partial<User>
): Promise<{ user: User | null; error: string | null }> {
  console.warn("updateUserProfileInMemoryAction: Actualización de perfil simulada en frontend. Los cambios NO se guardan en el backend debido a la falta de un endpoint en la API proporcionada.");
  // Esta función es llamada por AuthContext para actualizar el estado local.
  // En un escenario real con endpoint de backend, aquí se haría la llamada PUT.
  // Por ahora, solo devolvemos los datos actualizados como si la operación hubiera sido exitosa.
  console.log("todo: ERROR DEBERÍA SER UN ENDPOINT DEL BACKEND")
  return { user: updatedData as User, error: null };
}


export async function requestTransactionAction(
  userGoogleId: string,
  amount: number,
  type: "DEPOSITO" | "RETIRO"
): Promise<{ transaction: BackendTransaccionResponseDto | null; error: string | null }> {
  const payload: BackendTransaccionRequestDto = {
    usuarioId: userGoogleId, // Se usa googleId
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
  userGoogleId: string,
  amount: number,
  gameMode: string
): Promise<{ bet: BackendApuestaResponseDto | null; error: string | null }> {
  const payload: BackendApuestaRequestDto = {
    jugador1Id: userGoogleId, // Se usa googleId
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
  userGoogleId: string
): Promise<{ transactions: BackendTransaccionResponseDto[] | null; error: string | null }> {
  try {
    // Asumimos que el endpoint /api/transacciones/usuario/{id} espera el googleId
    const response = await fetch(`${BACKEND_URL}/api/transacciones/usuario/${userGoogleId}`);
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

