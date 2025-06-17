
'use server';

import type { User, RegisterFormValues, LoginFormValues } from '@/types';

// Simulación de una base de datos en memoria del servidor
const usersInServerMemoryDb: User[] = [];

// Usuario de demostración constante
const demoUser: User = {
  id: 'user-123-demo',
  phone: "0000000",
  password: "0000",
  username: 'DemoUser',
  clashTag: 'Player#ABC',
  nequiAccount: '3001112233',
  avatarUrl: 'https://placehold.co/100x100.png?text=D',
  balance: 50000,
  friendLink: 'https://link.clashroyale.com/invite/friend/es?tag=DEMOTAG&token=demotoken&platform=android',
};

export async function registerUserAction(
  data: RegisterFormValues
): Promise<{ user: User; error?: null } | { user: null; error: string }> {
  try {
    // Verificar si el usuario ya existe en la "BD en memoria"
    const existingUserByPhone = usersInServerMemoryDb.find(u => u.phone === data.phone);
    if (existingUserByPhone) {
      return { user: null, error: 'El número de teléfono ya está registrado.' };
    }
    const existingUserByUsername = usersInServerMemoryDb.find(u => u.username === data.username);
    if (existingUserByUsername) {
      return { user: null, error: 'El nombre de usuario ya está en uso.' };
    }

    const clashTagValue = data.clashTag
      ? (data.clashTag.toUpperCase().startsWith('#') ? data.clashTag.toUpperCase() : `#${data.clashTag.toUpperCase()}`)
      : '#DEFAULTTAG';

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      username: data.username,
      phone: data.phone,
      password: data.password, // En un backend real, esto estaría hasheado.
      clashTag: clashTagValue,
      nequiAccount: data.phone,
      friendLink: data.friendLink,
      avatarUrl: `https://placehold.co/100x100.png?text=${data.username[0]?.toUpperCase() || 'R'}`,
      balance: 0,
    };

    usersInServerMemoryDb.push(newUser);
    // console.log('Usuarios en BD en memoria:', usersInServerMemoryDb);
    return { user: newUser, error: null };
  } catch (e) {
    // console.error("Error en registerUserAction:", e);
    return { user: null, error: 'Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.' };
  }
}

export async function loginUserAction(
  loginData: LoginFormValues
): Promise<{ user: User; error?: null } | { user: null; error: string }> {
  try {
    // Lógica para el usuario de demostración
    if (loginData.phone === demoUser.phone) {
      if (loginData.password === demoUser.password) {
        return { user: demoUser, error: null };
      } else {
        return { user: null, error: "Contraseña incorrecta para el usuario Demo." };
      }
    }

    // Buscar usuario en la "BD en memoria"
    const foundUser = usersInServerMemoryDb.find(u => u.phone === loginData.phone);

    if (foundUser) {
      if (foundUser.password === loginData.password) { // Comparación directa, en real sería hash
        return { user: foundUser, error: null };
      } else {
        return { user: null, error: "Contraseña incorrecta." };
      }
    }

    return { user: null, error: "Usuario no encontrado. Por favor, regístrate si eres nuevo." };

  } catch (e) {
    // console.error("Error en loginUserAction:", e);
    return { user: null, error: 'Ocurrió un error durante el inicio de sesión. Por favor, inténtalo de nuevo.' };
  }
}

// Nota: Las funciones para actualizar perfil, depositar saldo, etc., también necesitarían
// interactuar con `usersInServerMemoryDb` si se quiere que los cambios persistan (durante la sesión del servidor).
// Por ahora, esas operaciones en AuthContext solo afectarán el estado del cliente.

