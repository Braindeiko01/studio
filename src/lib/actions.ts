'use server';

import type {
  User,
  BackendUsuarioDto,
  RegisterWithGoogleData,
  BackendTransaccionRequestDto,
  BackendTransaccionResponseDto,
  BackendApuestaRequestDto,
  BackendApuestaResponseDto
} from '@/types';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

export async function registerUserAction(
  data: RegisterWithGoogleData
): Promise<{ user: User | null; error: string | null }> {
  try {
    const tagSinHash = data.clashTag?.startsWith('#') ? data.clashTag.substring(1) : data.clashTag;

    const backendPayload: BackendUsuarioDto = {
      id: data.googleId,
      nombre: data.username,
      email: data.email,
      telefono: data.phone,
      tagClash: tagSinHash || '',
      linkAmistad: data.friendLink,
    };

    const response = await fetch(`${BACKEND_URL}/api/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error en el registro.' }));
      return { user: null, error: errorData.message || `Error ${response.status}` };
    }

    const registeredUser: BackendUsuarioDto = await response.json();
    const appUser: User = {
      id: registeredUser.id || data.googleId,
      username: registeredUser.nombre,
      email: registeredUser.email,
      phone: registeredUser.telefono,
      clashTag: `#${registeredUser.tagClash}`,
      nequiAccount: registeredUser.telefono,
      balance: registeredUser.saldo || 0,
      friendLink: registeredUser.linkAmistad || '',
      avatarUrl: data.avatarUrl || `https://placehold.co/100x100.png?text=${registeredUser.nombre[0]?.toUpperCase() || 'U'}`,
      reputacion: registeredUser.reputacion || 0,
    };

    return { user: appUser, error: null };
  } catch (e: any) {
    return { user: null, error: e.message || 'Error inesperado al registrar usuario.' };
  }
}

export async function loginWithGoogleAction(
  googleId: string,
  email: string,
  username: string,
  avatarUrl?: string
): Promise<{ user: User | null; error: string | null; needsProfileCompletion?: boolean }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/usuarios/${googleId}`);

    if (response.ok) {
      const backendUser: BackendUsuarioDto = await response.json();
      const appUser: User = {
        id: backendUser.id || googleId,
        username: backendUser.nombre,
        email: backendUser.email,
        phone: backendUser.telefono,
        clashTag: `#${backendUser.tagClash}`,
        nequiAccount: backendUser.telefono,
        balance: backendUser.saldo || 0,
        friendLink: backendUser.linkAmistad || '',
        avatarUrl: avatarUrl || `https://placehold.co/100x100.png?text=${backendUser.nombre[0]?.toUpperCase() || 'U'}`,
        reputacion: backendUser.reputacion || 0,
      };
      return { user: appUser, error: null };
    } else if (response.status === 404) {
      const partialUser: User = {
        id: googleId,
        email,
        username,
        avatarUrl,
        phone: '',
        clashTag: '',
        nequiAccount: '',
        balance: 0,
        friendLink: '',
        reputacion: 0,
      };
      return { user: partialUser, error: null, needsProfileCompletion: true };
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Error en login.' }));
      return { user: null, error: errorData.message || `Error ${response.status}` };
    }
  } catch (e: any) {
    return { user: null, error: e.message || 'Error inesperado en login.' };
  }
}

export async function getUserDataAction(userId: string): Promise<{ user: User | null; error: string | null }> {
  if (!userId) return { user: null, error: "ID de usuario requerido." };

  try {
    const response = await fetch(`${BACKEND_URL}/api/usuarios/${userId}`);
    if (!response.ok) {
      if (response.status === 404) return { user: null, error: "Usuario no encontrado." };
      const errorData = await response.json().catch(() => ({ message: 'Error en la respuesta del backend.' }));
      return { user: null, error: errorData.message || `Error ${response.status}` };
    }

    const backendUser: BackendUsuarioDto = await response.json();
    const appUser: User = {
      id: backendUser.id || userId,
      username: backendUser.nombre,
      email: backendUser.email,
      phone: backendUser.telefono,
      clashTag: `#${backendUser.tagClash}`,
      nequiAccount: backendUser.telefono,
      balance: backendUser.saldo || 0,
      friendLink: backendUser.linkAmistad || '',
      avatarUrl: `https://placehold.co/100x100.png?text=${backendUser.nombre[0]?.toUpperCase() || 'U'}`,
      reputacion: backendUser.reputacion || 0,
    };

    return { user: appUser, error: null };
  } catch (e: any) {
    return { user: null, error: e.message || 'Error al obtener datos del usuario.' };
  }
}

export async function requestTransactionAction(
  userId: string,
  amount: number,
  type: "DEPOSITO" | "RETIRO"
): Promise<{ transaction: BackendTransaccionResponseDto | null; error: string | null }> {
  if (!userId) return { transaction: null, error: "ID de usuario requerido." };

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
      const errorData = await response.json().catch(() => ({ message: 'Error en transacción.' }));
      return { transaction: null, error: errorData.message || `Error ${response.status}` };
    }

    const transaction: BackendTransaccionResponseDto = await response.json();
    return { transaction, error: null };
  } catch (e: any) {
    return { transaction: null, error: e.message || 'Error al procesar transacción.' };
  }
}

export async function createBetAction(
  userId: string,
  amount: number,
  gameMode: string
): Promise<{ bet: BackendApuestaResponseDto | null; error: string | null }> {
  if (!userId) return { bet: null, error: "ID de usuario requerido." };

  try {
    const payload: BackendApuestaRequestDto = {
      jugador1Id: userId,
      monto: amount,
      modoJuego: gameMode,
    };

    const response = await fetch(`${BACKEND_URL}/api/apuestas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al crear apuesta.' }));
      return { bet: null, error: errorData.message || `Error ${response.status}` };
    }

    const bet: BackendApuestaResponseDto = await response.json();
    return { bet, error: null };
  } catch (e: any) {
    return { bet: null, error: e.message || 'Error inesperado al crear apuesta.' };
  }
}

export async function getUserTransactionsAction(
  userId: string
): Promise<{ transactions: BackendTransaccionResponseDto[] | null; error: string | null }> {
  if (!userId) return { transactions: null, error: "ID de usuario requerido." };

  try {
    const response = await fetch(`${BACKEND_URL}/api/transacciones/usuario/${userId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al obtener transacciones.' }));
      return { transactions: null, error: errorData.message || `Error ${response.status}` };
    }

    const transactions: BackendTransaccionResponseDto[] = await response.json();
    return { transactions, error: null };
  } catch (e: any) {
    return { transactions: null, error: e.message || 'Error inesperado al obtener transacciones.' };
  }
}
