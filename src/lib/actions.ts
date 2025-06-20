
'use server';

import type { User, RegisterFormValues, LoginFormValues, BackendUsuarioDto, BackendTransaccionRequestDto, BackendTransaccionResponseDto, BackendApuestaRequestDto, BackendApuestaResponseDto } from '@/types';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

// Usuario de demostración constante (para login simulado)
const demoUser: User = {
  id: 'user-123-demo',
  phone: "0000000",
  password: "0000", // Password para la simulación de login local
  username: 'DemoUser',
  email: 'demo@example.com',
  clashTag: '#DEMOTAG',
  nequiAccount: '3001112233',
  avatarUrl: 'https://placehold.co/100x100.png?text=D',
  balance: 50000,
  friendLink: 'https://link.clashroyale.com/invite/friend/es?tag=DEMOTAG&token=demotoken&platform=android',
  reputacion: 5
};

// Simulación de una base de datos en memoria del servidor para usuarios de DEMO o si el backend falla.
// Los usuarios reales se gestionarán via API.
const usersInServerMemoryDb: User[] = [demoUser];


export async function registerUserAction(
  data: RegisterFormValues
): Promise<{ user: User | null; error: string | null }> {
  try {
    const tagSinHash = data.clashTag?.startsWith('#') ? data.clashTag.substring(1) : data.clashTag;

    const payload: BackendUsuarioDto = {
      nombre: data.username, // Mapea username del form a nombre para el backend
      email: data.email,
      telefono: data.phone,
      tagClash: tagSinHash || '', // Asegura que no sea undefined
      linkAmistad: data.friendLink,
      // saldo y reputacion se inicializarán en el backend.
    };

    const response = await fetch(`${BACKEND_URL}/api/usuarios/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error en el registro. Inténtalo de nuevo.' }));
      console.error('Backend registration error:', errorData);
      return { user: null, error: errorData.message || `Error ${response.status}` };
    }

    // Asumimos que el backend devuelve el UsuarioDto completo, incluyendo id, saldo, etc.
    const registeredUserDto: BackendUsuarioDto = await response.json();

    if (!registeredUserDto.id) {
        console.error('Backend did not return user ID upon registration');
        return { user: null, error: 'El registro fue exitoso pero no se pudo obtener el ID del usuario del backend.' };
    }


    const appUser: User = {
      id: registeredUserDto.id,
      username: registeredUserDto.nombre,
      email: registeredUserDto.email,
      phone: registeredUserDto.telefono,
      clashTag: registeredUserDto.tagClash.startsWith('#') ? registeredUserDto.tagClash : `#${registeredUserDto.tagClash}`,
      nequiAccount: registeredUserDto.telefono, // Asumiendo que Nequi usa el mismo teléfono
      balance: registeredUserDto.saldo || 0,
      friendLink: registeredUserDto.linkAmistad || '',
      avatarUrl: `https://placehold.co/100x100.png?text=${registeredUserDto.nombre[0]?.toUpperCase() || 'U'}`,
      reputacion: registeredUserDto.reputacion || 0,
      // Password no se almacena ni se devuelve del backend.
    };
    
    // Opcional: Podrías guardar el appUser en la BD en memoria si quisieras un fallback o para testing
    // pero el backend es la fuente de verdad.
    // usersInServerMemoryDb.push(appUser); 

    return { user: appUser, error: null };

  } catch (e: any) {
    console.error("Error en registerUserAction:", e);
    return { user: null, error: e.message || 'Ocurrió un error durante el registro.' };
  }
}

// LOGIN: Debido a que el backend NO PROPORCIONA un endpoint de login con contraseña,
// este action seguirá siendo una SIMULACIÓN LOCAL para el usuario demo.
// Los usuarios registrados con el backend NO podrán usar este login.
export async function loginUserAction(
  loginData: LoginFormValues
): Promise<{ user: User | null; error: string | null }> {
  try {
    // Lógica para el usuario de demostración
    if (loginData.phone === demoUser.phone) {
      if (loginData.password === demoUser.password) {
        return { user: demoUser, error: null };
      } else {
        return { user: null, error: "Contraseña incorrecta para el usuario Demo." };
      }
    }
    
    // Para otros usuarios, no podemos validar contra el backend con la API actual.
    // Podríamos intentar obtener el usuario por ID si tuviéramos una forma de mapear phone a ID sin autenticar.
    // Por ahora, devolvemos error para usuarios no-demo.
    return { user: null, error: "Función de login no disponible para usuarios registrados. Por favor, usa el usuario Demo o regístrate." };

  } catch (e: any) {
    console.error("Error en loginUserAction:", e);
    return { user: null, error: e.message || 'Ocurrió un error durante el inicio de sesión.' };
  }
}


export async function requestTransactionAction(
  userId: string,
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
    return { transaction, error: null };
  } catch (e: any) {
    console.error(`Error en ${type === "DEPOSITO" ? "deposit" : "withdraw"}Action:`, e);
    return { transaction: null, error: e.message || 'Ocurrió un error en la transacción.' };
  }
}

export async function createBetAction(
  userId: string,
  amount: number,
  gameMode: string
): Promise<{ bet: BackendApuestaResponseDto | null; error: string | null }> {
  if (!userId) return { bet: null, error: "ID de usuario es requerido." };
  
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

export async function getUserDataAction(userId: string): Promise<{ user: User | null; error: string | null }> {
    if (!userId) return { user: null, error: "ID de usuario es requerido."};
    try {
        const response = await fetch(`${BACKEND_URL}/api/usuarios/${userId}`);
        if (!response.ok) {
            if (response.status === 404) return { user: null, error: "Usuario no encontrado."};
            const errorData = await response.json().catch(() => ({ message: 'Error al obtener datos del usuario.' }));
            return { user: null, error: errorData.message || `Error ${response.status}` };
        }
        const backendUser: BackendUsuarioDto = await response.json();
        
        const appUser: User = {
            id: backendUser.id!, // Asumimos que el ID siempre vendrá en la respuesta GET exitosa
            username: backendUser.nombre,
            email: backendUser.email,
            phone: backendUser.telefono,
            clashTag: backendUser.tagClash.startsWith('#') ? backendUser.tagClash : `#${backendUser.tagClash}`,
            nequiAccount: backendUser.telefono,
            balance: backendUser.saldo || 0,
            friendLink: backendUser.linkAmistad || '',
            avatarUrl: `https://placehold.co/100x100.png?text=${backendUser.nombre[0]?.toUpperCase() || 'U'}`,
            reputacion: backendUser.reputacion || 0,
        };
        return { user: appUser, error: null };

    } catch (e: any) {
        console.error("Error en getUserDataAction:", e);
        return { user: null, error: e.message || 'Ocurrió un error al obtener los datos del usuario.' };
    }
}
