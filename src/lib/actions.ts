
'use server';

import type { User, BackendUsuarioDto, RegisterWithGoogleData, BackendTransaccionRequestDto, BackendTransaccionResponseDto, BackendApuestaRequestDto, BackendApuestaResponseDto } from '@/types';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

// Simulación de una base de datos en memoria del servidor para usuarios.
// El ID del usuario ahora será el googleId.
const usersInServerMemoryDb: User[] = [];

// Usuario de demostración (ya no se usa para login, pero puede ser referencia)
const demoUserSeed: Omit<User, 'id' | 'email'> = {
  phone: "0000000",
  username: 'DemoUserOriginal',
  clashTag: '#DEMOTAG',
  nequiAccount: '3001112233',
  avatarUrl: 'https://placehold.co/100x100.png?text=D',
  balance: 50000,
  friendLink: 'https://link.clashroyale.com/invite/friend/es?tag=DEMOTAG&token=demotoken&platform=android',
  reputacion: 5
};

// Función para registrar o actualizar usuario con datos de Google y formulario adicional
export async function registerUserAction(
  data: RegisterWithGoogleData
): Promise<{ user: User | null; error: string | null }> {
  try {
    const existingUser = usersInServerMemoryDb.find(u => u.id === data.googleId);
    if (existingUser) {
      // Si ya existe, podríamos actualizarlo, pero para un registro, esto sería un error de flujo
      // o debería ser una actualización de perfil. Por ahora, devolvemos el usuario existente.
      // Opcionalmente, podríamos actualizar campos si es un "completar perfil".
      // Para este ejemplo, si ya existe, lo consideramos un "ya registrado".
      return { user: existingUser, error: "Este usuario de Google ya está registrado." };
    }

    const tagSinHash = data.clashTag?.startsWith('#') ? data.clashTag.substring(1) : data.clashTag;

    const backendPayload: BackendUsuarioDto = {
      id: data.googleId, // Enviamos el googleId como id al backend
      nombre: data.username,
      email: data.email,
      telefono: data.phone,
      tagClash: tagSinHash || '',
      linkAmistad: data.friendLink,
      // Saldo y reputación serían inicializados por el backend o con valores por defecto
    };

    console.log("Enviando a /api/usuarios/registro:", JSON.stringify(backendPayload));
    const response = await fetch(`${BACKEND_URL}/api/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error en el registro con el backend.' }));
      console.error('Backend registration error:', errorData);
      return { user: null, error: errorData.message || `Error ${response.status} del backend.` };
    }

    const registeredBackendUser: BackendUsuarioDto = await response.json();
    
    // Construimos el objeto User de la app
    const appUser: User = {
      id: registeredBackendUser.id || data.googleId, // El backend debe devolver el ID (googleId)
      username: registeredBackendUser.nombre,
      email: registeredBackendUser.email,
      phone: registeredBackendUser.telefono,
      clashTag: registeredBackendUser.tagClash.startsWith('#') ? registeredBackendUser.tagClash : `#${registeredBackendUser.tagClash}`,
      nequiAccount: registeredBackendUser.telefono, // Asumiendo Nequi usa el mismo teléfono
      balance: registeredBackendUser.saldo !== undefined ? registeredBackendUser.saldo : 0, // Saldo inicial del backend o 0
      friendLink: registeredBackendUser.linkAmistad || '',
      avatarUrl: data.avatarUrl || `https://placehold.co/100x100.png?text=${registeredBackendUser.nombre[0]?.toUpperCase() || 'U'}`,
      reputacion: registeredBackendUser.reputacion !== undefined ? registeredBackendUser.reputacion : 0,
    };

    // Guardar/actualizar en nuestra DB en memoria (simulación)
    const userIndex = usersInServerMemoryDb.findIndex(u => u.id === appUser.id);
    if (userIndex > -1) {
      usersInServerMemoryDb[userIndex] = appUser;
    } else {
      usersInServerMemoryDb.push(appUser);
    }
    
    console.log("Usuario registrado/actualizado en memoria:", appUser);
    return { user: appUser, error: null };

  } catch (e: any) {
    console.error("Error en registerUserAction:", e);
    return { user: null, error: e.message || 'Ocurrió un error durante el registro.' };
  }
}


export async function loginWithGoogleAction(
  googleId: string,
  email: string,
  username: string, // 'nombre' de Google
  avatarUrl?: string
): Promise<{ user: User | null; error: string | null; needsProfileCompletion?: boolean }> {
  try {
    // Intenta obtener el usuario del backend por ID (googleId)
    const backendUserResponse = await fetch(`${BACKEND_URL}/api/usuarios/${googleId}`);

    if (backendUserResponse.ok) {
      const backendUser: BackendUsuarioDto = await backendUserResponse.json();
      const appUser: User = {
        id: backendUser.id || googleId,
        username: backendUser.nombre,
        email: backendUser.email,
        phone: backendUser.telefono,
        clashTag: backendUser.tagClash.startsWith('#') ? backendUser.tagClash : `#${backendUser.tagClash}`,
        nequiAccount: backendUser.telefono,
        balance: backendUser.saldo || 0,
        friendLink: backendUser.linkAmistad || '',
        avatarUrl: avatarUrl || `https://placehold.co/100x100.png?text=${backendUser.nombre[0]?.toUpperCase() || 'U'}`,
        reputacion: backendUser.reputacion || 0,
      };
      // Actualizar DB en memoria
      const userIndex = usersInServerMemoryDb.findIndex(u => u.id === appUser.id);
      if (userIndex > -1) usersInServerMemoryDb[userIndex] = appUser; else usersInServerMemoryDb.push(appUser);
      return { user: appUser, error: null };
    } else if (backendUserResponse.status === 404) {
      // Usuario no encontrado en el backend, podría ser un primer login con Google
      // No lo registramos aquí directamente, el flujo de "register" lo haría
      // después de pedir datos adicionales.
      // Indicamos que necesita completar el perfil.
      // Devolvemos los datos de Google para pre-rellenar el formulario de completar perfil.
      const partialUser: User = {
        id: googleId,
        email: email,
        username: username,
        avatarUrl: avatarUrl,
        phone: '', // Estos se pedirán
        clashTag: '', // Estos se pedirán
        nequiAccount: '', // Se usará el teléfono
        balance: 0, // Saldo inicial
        friendLink: '', // Estos se pedirán
        reputacion: 0,
      }
      return { user: partialUser, error: null, needsProfileCompletion: true };
    } else {
      // Otro error del backend
      const errorData = await backendUserResponse.json().catch(() => ({ message: 'Error al buscar usuario en el backend.' }));
      return { user: null, error: errorData.message || `Error ${backendUserResponse.status} del backend.` };
    }
  } catch (e: any) {
    console.error("Error en loginWithGoogleAction:", e);
    return { user: null, error: e.message || 'Ocurrió un error durante el inicio de sesión con Google.' };
  }
}


export async function getUserDataAction(userId: string): Promise<{ user: User | null; error: string | null }> {
    if (!userId) return { user: null, error: "ID de usuario (Google ID) es requerido."};
    try {
        // Primero intenta buscar en la DB en memoria (simulación)
        const memoryUser = usersInServerMemoryDb.find(u => u.id === userId);
        if (memoryUser) {
            return { user: memoryUser, error: null };
        }

        // Si no está en memoria, intenta con el backend
        const response = await fetch(`${BACKEND_URL}/api/usuarios/${userId}`); // userId es googleId
        if (!response.ok) {
            if (response.status === 404) return { user: null, error: "Usuario no encontrado en el backend."};
            const errorData = await response.json().catch(() => ({ message: 'Error al obtener datos del usuario del backend.' }));
            return { user: null, error: errorData.message || `Error ${response.status} del backend.` };
        }
        const backendUser: BackendUsuarioDto = await response.json();
        
        const appUser: User = {
            id: backendUser.id || userId, 
            username: backendUser.nombre,
            email: backendUser.email,
            phone: backendUser.telefono,
            clashTag: backendUser.tagClash.startsWith('#') ? backendUser.tagClash : `#${backendUser.tagClash}`,
            nequiAccount: backendUser.telefono,
            balance: backendUser.saldo || 0,
            friendLink: backendUser.linkAmistad || '',
            avatarUrl: `https://placehold.co/100x100.png?text=${backendUser.nombre[0]?.toUpperCase() || 'U'}`, // Podríamos usar el avatar de Google si lo tuviéramos
            reputacion: backendUser.reputacion || 0,
        };
        // Guardar en memoria para futuras búsquedas rápidas
        usersInServerMemoryDb.push(appUser);
        return { user: appUser, error: null };

    } catch (e: any) {
        console.error("Error en getUserDataAction:", e);
        return { user: null, error: e.message || 'Ocurrió un error al obtener los datos del usuario.' };
    }
}


export async function requestTransactionAction(
  userId: string, // googleId
  amount: number,
  type: "DEPOSITO" | "RETIRO"
): Promise<{ transaction: BackendTransaccionResponseDto | null; error: string | null }> {
  if (!userId) return { transaction: null, error: "ID de usuario es requerido." };

  try {
    const payload: BackendTransaccionRequestDto = {
      usuarioId: userId,
      monto: amount,
      tipo: type,
    };

    const response = await fetch(`${BACKEND_URL}/api/transacciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error al ${type === "DEPOSITO" ? "depositar" : "retirar"}.` }));
      return { transaction: null, error: errorData.message || `Error ${response.status}` };
    }
    const transaction: BackendTransaccionResponseDto = await response.json();
    // Aquí podríamos querer actualizar el saldo del usuario en usersInServerMemoryDb si la transacción es APROBADA de inmediato
    // pero la API sugiere que el estado puede ser PENDIENTE.
    return { transaction, error: null };
  } catch (e: any) {
    console.error(`Error en ${type === "DEPOSITO" ? "deposit" : "withdraw"}Action:`, e);
    return { transaction: null, error: e.message || 'Ocurrió un error en la transacción.' };
  }
}

export async function createBetAction(
  userId: string, // googleId
  amount: number,
  gameMode: string
): Promise<{ bet: BackendApuestaResponseDto | null; error: string | null }> {
  if (!userId) return { bet: null, error: "ID de usuario es requerido." };
  
  try {
    const payload: BackendApuestaRequestDto = {
      jugador1Id: userId,
      monto: amount,
      modoJuego: gameMode,
      // jugador2Id sería undefined si es una apuesta abierta
    };

    const response = await fetch(`${BACKEND_URL}/api/apuestas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al crear la apuesta.' }));
      return { bet: null, error: errorData.message || `Error ${response.status}` };
    }
    const bet: BackendApuestaResponseDto = await response.json();
    return { bet, error: null };
  } catch (e: any) {
    console.error("Error en createBetAction:", e);
    return { bet: null, error: e.message || 'Ocurrió un error al crear la apuesta.' };
  }
}

export async function getUserTransactionsAction(userId: string): Promise<{ transactions: BackendTransaccionResponseDto[] | null; error: string | null }> {
  if (!userId) return { transactions: null, error: "ID de usuario es requerido." };
  try {
    const response = await fetch(`${BACKEND_URL}/api/transacciones/usuario/${userId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al obtener transacciones.' }));
      return { transactions: null, error: errorData.message || `Error ${response.status}` };
    }
    const transactions: BackendTransaccionResponseDto[] = await response.json();
    return { transactions, error: null };
  } catch (e: any) {
    console.error("Error en getUserTransactionsAction:", e);
    return { transactions: null, error: e.message || 'Ocurrió un error al obtener las transacciones.' };
  }
}

// Simulación de actualización de perfil (solo en memoria por ahora)
export async function updateUserProfileInMemoryAction(
  userId: string, // googleId
  updatedData: Partial<Pick<User, 'clashTag' | 'nequiAccount' | 'friendLink' | 'phone' | 'avatarUrl' | 'username'>>
): Promise<{ user: User | null; error: string | null }> {
  const userIndex = usersInServerMemoryDb.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return { user: null, error: "Usuario no encontrado para actualizar." };
  }
  usersInServerMemoryDb[userIndex] = { ...usersInServerMemoryDb[userIndex], ...updatedData };
  
  // En un escenario real, aquí llamarías a un endpoint PUT /api/usuarios/{id} del backend
  // con los campos permitidos para actualizar.
  // Por ejemplo:
  // const backendPayload = { nombre: updatedData.username, telefono: updatedData.phone, ... }
  // await fetch(`${BACKEND_URL}/api/usuarios/${userId}`, { method: 'PUT', body: JSON.stringify(backendPayload) });

  return { user: usersInServerMemoryDb[userIndex], error: null };
}

    