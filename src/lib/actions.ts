
'use server';

import type {
  User,
  RegisterWithGoogleData,
  // Backend DTOs - currently not used for in-memory operations but kept for potential future use
  BackendUsuarioDto,
  BackendTransaccionRequestDto,
  BackendTransaccionResponseDto,
  BackendApuestaRequestDto,
  BackendApuestaResponseDto,
  BackendPartidaRequestDto,
  BackendPartidaResponseDto,
  BackendMatchResultDto,
} from '@/types';

// Simulación de base de datos en memoria del servidor
let usersInServerMemoryDb: User[] = [];

// URL del Backend (si se usara en el futuro, por ahora las actions operan en memoria)
const BACKEND_URL = process.env.BACKEND_API_URL || 'crduels-crduelsproduction.up.railway.app';


export async function registerUserAction(
  data: RegisterWithGoogleData
): Promise<{ user: User | null; error: string | null }> {
  const existingUserById = usersInServerMemoryDb.find(u => u.id === data.googleId);
  if (existingUserById) {
    return { user: null, error: `El usuario con Google ID ${data.googleId} ya está registrado. Intenta iniciar sesión.` };
  }
  
  // El email también debería ser único si se considera un identificador secundario
  const existingUserByEmail = usersInServerMemoryDb.find(u => u.email.toLowerCase() === data.email.toLowerCase());
  if (existingUserByEmail) {
    return { user: null, error: `El correo electrónico ${data.email} ya está en uso.`};
  }

  const existingUserByPhone = usersInServerMemoryDb.find(u => u.phone === data.phone);
  if (existingUserByPhone) {
    return { user: null, error: `El número de teléfono ${data.phone} ya está en uso.` };
  }

  const newUser: User = {
    id: data.googleId, // googleId is the main ID
    username: data.username, // from Google
    email: data.email, // from Google
    phone: data.phone, // from app form
    clashTag: data.clashTag || '', // from app form (or extracted from friendLink)
    nequiAccount: data.phone, // Use phone as Nequi account
    balance: 0, // Initial balance
    friendLink: data.friendLink || '', // from app form
    avatarUrl: data.avatarUrl || `https://placehold.co/100x100.png?text=${data.username[0]?.toUpperCase() || 'U'}`,
    reputacion: 0, // Initial reputation
  };

  usersInServerMemoryDb.push(newUser);
  // console.log('User registered in-memory:', newUser);
  // console.log('Current DB:', usersInServerMemoryDb.map(u => ({id: u.id, username: u.username, phone: u.phone, email: u.email })));
  return { user: newUser, error: null };
}


export async function loginWithGoogleAction(
  googleId: string,
  email: string,
  username: string,
  avatarUrl?: string
): Promise<{ user: User | null; error: string | null; needsProfileCompletion?: boolean }> {
  // console.log('Attempting Google login for ID:', googleId);
  const existingUser = usersInServerMemoryDb.find(u => u.id === googleId);

  if (existingUser) {
    // console.log('User found in DB:', existingUser);
    // Optionally update avatar/email/username if they changed in Google, for consistency
    existingUser.email = email; // Ensure email from Google is current
    existingUser.username = username; // Ensure username from Google is current
    if (avatarUrl) existingUser.avatarUrl = avatarUrl;
    return { user: existingUser, error: null };
  } else {
    // User signed in with Google but is not in our DB yet.
    // This means they need to complete the profile.
    // We return a partial user object that the client can use to prefill the "complete profile" form.
    // console.log('User not in DB, needs profile completion. Google Data:', { googleId, email, username, avatarUrl });
    const partialUser: User = { // This is a temporary structure to pass data to the registration form
      id: googleId,
      email,
      username,
      avatarUrl,
      phone: '', // to be filled by user
      clashTag: '', // to be filled by user
      nequiAccount: '', // to be filled by user (will be phone)
      balance: 0,
      friendLink: '', // to be filled by user
      reputacion: 0,
    };
    return { user: partialUser, error: null, needsProfileCompletion: true };
  }
}

export async function getUserDataAction(userId: string): Promise<{ user: User | null; error: string | null }> {
  // userId here is expected to be the googleId
  // console.log('Getting user data for ID (googleId):', userId);
  const user = usersInServerMemoryDb.find(u => u.id === userId);
  if (user) {
    // console.log('User found for getUserDataAction:', user);
    return { user, error: null };
  }
  // console.log('User not found for getUserDataAction. Current DB:', usersInServerMemoryDb.map(u => ({id: u.id, username: u.username})));
  return { user: null, error: 'Usuario no encontrado en la base de datos en memoria.' };
}

export async function updateUserProfileInMemoryAction(
  userId: string, // This is googleId
  updatedData: Partial<User>
): Promise<{ user: User | null; error: string | null }> {
  const userIndex = usersInServerMemoryDb.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { user: null, error: 'Usuario no encontrado para actualizar.' };
  }

  const currentUserState = usersInServerMemoryDb[userIndex];
  
  // Create the new user data object by merging current state with updates
  const newUserData: User = {
    ...currentUserState,
    ...updatedData,
  };

  // If nequiAccount is updated in formData, it means the phone number for Nequi changed.
  // We assume phone and nequiAccount are the same in this app's logic.
  if (updatedData.nequiAccount) {
    newUserData.phone = updatedData.nequiAccount;
  }
  // If (for some reason) 'phone' was part of updatedData directly
  if (updatedData.phone) {
    newUserData.nequiAccount = updatedData.phone;
  }
  
  usersInServerMemoryDb[userIndex] = newUserData;

  // console.log('User profile updated in-memory:', usersInServerMemoryDb[userIndex]);
  return { user: usersInServerMemoryDb[userIndex], error: null };
}


// --- Placeholder/Future Backend-connected Actions (currently not fully used) ---

// Example of how a backend call might look (not used by current in-memory logic)
async function registerUserWithBackend(backendPayload: BackendUsuarioDto): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/usuarios/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backendPayload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en el registro con backend.' }));
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  return response.json();
}


export async function requestTransactionAction(
  userId: string,
  amount: number,
  type: "DEPOSITO" | "RETIRO"
): Promise<{ transaction: BackendTransaccionResponseDto | null; error: string | null }> {
  // This function would call the backend. For now, it's a placeholder.
  // console.log(`Simulating transaction request for user ${userId}: ${type} ${amount}`);
  // In a real scenario:
  /*
  try {
    const payload: BackendTransaccionRequestDto = { usuarioId: userId, monto: amount, tipo };
    const response = await fetch(`${BACKEND_URL}/api/transacciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) { /* ... error handling ... * / }
    const transaction: BackendTransaccionResponseDto = await response.json();
    return { transaction, error: null };
  } catch (e: any) {
    return { transaction: null, error: e.message || 'Error al procesar transacción.' };
  }
  */
  // For prototype, return a mock success or handle in client state
  return { transaction: { id: `trans_${Date.now()}`, usuarioId: userId, monto: amount, tipo, estado: 'PENDIENTE', creadoEn: new Date().toISOString() }, error: null };
}

export async function createBetAction(
  userId: string,
  amount: number,
  gameMode: string
): Promise<{ bet: BackendApuestaResponseDto | null; error: string | null }> {
  // This function would call the backend. For now, it's a placeholder.
  // console.log(`Simulating bet creation for user ${userId}: ${gameMode} ${amount}`);
  // For prototype, return a mock success
  return { bet: { id: `bet_${Date.now()}`, monto: amount, modoJuego: gameMode, estado: 'PENDIENTE', creadoEn: new Date().toISOString(), jugador1Id: userId }, error: null };
}

export async function getUserTransactionsAction(
  userId: string
): Promise<{ transactions: BackendTransaccionResponseDto[] | null; error: string | null }> {
  // This function would call the backend. For now, it's a placeholder.
  // console.log(`Simulating fetching transactions for user ${userId}`);
  // For prototype, return empty array
  return { transactions: [], error: null };
}
