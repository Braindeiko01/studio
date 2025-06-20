
'use server';

import type {
  User,
  RegisterWithGoogleData, // Cambiado desde RegisterData para claridad
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

// Simulación de base de datos en memoria del servidor (ya no se usa activamente si todo va al backend)
// let usersInServerMemoryDb: User[] = []; // Comentado ya que las operaciones principales deben ir al backend

export async function registerUserAction(
  data: RegisterWithGoogleData
): Promise<{ user: User | null; error: string | null }> {
  
  const backendPayload: Omit<BackendUsuarioDto, 'id' | 'saldo' | 'reputacion' | 'linkAmistad'> & { linkAmistad?: string } = {
    nombre: data.username,
    email: data.email,
    telefono: data.phone,
    tagClash: data.clashTag,
    linkAmistad: data.friendLink, // Asegurarse que este campo se incluya
  };

  try {
    const response = await fetch(`${BACKEND_URL}/api/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error del servidor: ${response.status}` }));
      // Intentar dar mensajes de error más específicos del backend si están disponibles
      if (errorData && errorData.message) {
        return { user: null, error: errorData.message };
      }
      // Fallback para errores genéricos de red o formato de respuesta inesperado
      return { user: null, error: `Error ${response.status} al registrar usuario. ${errorData.details || ''}`.trim() };
    }

    const registeredBackendUser = await response.json() as BackendUsuarioDto;

    if (!registeredBackendUser.id) {
        return { user: null, error: "El backend no devolvió un ID para el usuario registrado." };
    }

    const appUser: User = {
      id: registeredBackendUser.id, // ID del backend (UUID)
      googleId: data.googleId, // Guardamos el googleId original para referencia del frontend
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
  googleAuthValues: GoogleAuthValues
): Promise<{ user: User | null; error: string | null; needsProfileCompletion?: boolean }> {
  // LIMITACIÓN DE LA API ACTUAL:
  // Tu backend no tiene un endpoint para buscar un usuario por googleId o email.
  // Solo puede obtener un usuario por el ID de backend (GET /api/usuarios/{id}).
  // Por lo tanto, este "login" no puede verificar si el usuario ya existe en el backend
  // basándose únicamente en el googleId para traer sus datos.
  //
  // Flujo actual:
  // 1. Siempre se asume que el usuario podría ser nuevo o necesitar completar el perfil si no tenemos su ID de backend en localStorage.
  // 2. Devolvemos los datos de Google para que el frontend inicie el "paso 2" del registro.
  // 3. Si el usuario ya existe (detectado por el backend durante el `registerUserAction` por email/teléfono único),
  //    el backend debería devolver un error en ese punto.
  
  // console.log('loginWithGoogleAction: Datos de Google recibidos:', googleAuthValues);

  // Preparamos una estructura parcial para el frontend, indicando que se necesita completar el perfil.
  // El ID real del backend se obtendrá después del registro completo.
  const partialUserForProfileCompletion: User = {
      id: '', // Se llenará con el ID del backend después del registro.
      googleId: googleAuthValues.googleId,
      username: googleAuthValues.username,
      email: googleAuthValues.email,
      avatarUrl: googleAuthValues.avatarUrl,
      phone: '', // Estos campos se llenarán en el paso de completar perfil
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
        return { user: null, error: "El backend devolvió datos de usuario incompletos (sin ID)." };
    }

    // Asumimos que el googleId se guarda en localStorage si el usuario se logueó con Google,
    // ya que el backend no parece devolverlo directamente en este DTO.
    // Para mayor robustez, el `googleId` debería ser parte del `BackendUsuarioDto` si es relevante.
    const appUser: User = {
      id: backendUser.id, // ID del backend (UUID)
      // googleId: ??? Necesitaríamos obtenerlo de alguna parte si no viene en BackendUsuarioDto.
      // Por ahora, lo dejaremos undefined si no viene del backend.
      username: backendUser.nombre,
      email: backendUser.email,
      phone: backendUser.telefono,
      clashTag: backendUser.tagClash,
      nequiAccount: backendUser.telefono, // Asumimos que Nequi es el mismo teléfono
      balance: backendUser.saldo ?? 0,
      friendLink: backendUser.linkAmistad || '',
      avatarUrl: `https://placehold.co/100x100.png?text=${backendUser.nombre[0]?.toUpperCase() || 'U'}`, // Considerar si el avatar se guarda/devuelve
      reputacion: backendUser.reputacion ?? 0,
    };
    return { user: appUser, error: null };

  } catch (error: any) {
    console.error("Error en getUserDataAction:", error);
    return { user: null, error: error.message || "Ocurrió un error de red al obtener datos del usuario." };
  }
}

export async function updateUserProfileInMemoryAction(
  userId: string, // Este es el ID del backend (UUID)
  updatedData: Partial<User>
): Promise<{ user: User | null; error: string | null }> {
  
  // ** LIMITACIÓN IMPORTANTE DE LA API **
  // La API actual (según la especificación OpenAPI proporcionada) NO tiene un endpoint 
  // para actualizar el perfil de un usuario existente (ej. un PUT /api/usuarios/{id}).
  // Por lo tanto, esta función solo puede simular la actualización en la memoria del frontend.
  // Los cambios realizados aquí NO se persistirán en el backend.
  // Para una funcionalidad completa, necesitarás añadir un endpoint de actualización en tu backend.
  console.warn("updateUserProfileInMemoryAction: Actualización de perfil simulada. Los cambios NO se guardan en el backend debido a la falta de un endpoint en la API.");

  // Si tuviéramos una base de datos en memoria aquí (lo cual hemos evitado para enfocarnos en el backend real)
  // la lógica de actualización iría aquí. Como no la tenemos, y no hay endpoint de backend,
  // esta función es principalmente un marcador de posición para lo que el AuthContext espera.
  // El AuthContext actualiza su estado local de forma optimista.
  
  // Devolvemos el 'updatedData' como si hubiera sido exitoso, para que el AuthContext lo use.
  // Esto asume que el AuthContext ya tiene un objeto 'user' y lo mezcla con 'updatedData'.
  // Una implementación más robusta implicaría tener el objeto 'user' completo aquí.
  return { user: updatedData as User, error: null }; 
}


export async function requestTransactionAction(
  userId: string, // Backend User ID (UUID)
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
  userId: string, // Backend User ID (UUID)
  amount: number,
  gameMode: string
): Promise<{ bet: BackendApuestaResponseDto | null; error: string | null }> {
  const payload: BackendApuestaRequestDto = {
    jugador1Id: userId,
    // jugador2Id: undefined, // Para una apuesta abierta
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
  userId: string // Backend User ID (UUID)
): Promise<{ transactions: BackendTransaccionResponseDto[] | null; error: string | null }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/transacciones/usuario/${userId}`);
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
