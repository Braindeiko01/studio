
'use server';

import type { User, RegisterFormValues, LoginFormValues } from '@/types';

export async function registerUserAction(
  data: RegisterFormValues
): Promise<{ user: User; error?: null } | { user: null; error: string }> {
  try {
    // En un backend real, aquí se verificaría si el teléfono o username ya existen en la BD.
    // Se encriptaría la contraseña antes de guardarla.

    const clashTagValue = data.clashTag
      ? (data.clashTag.toUpperCase().startsWith('#') ? data.clashTag.toUpperCase() : `#${data.clashTag.toUpperCase()}`)
      : '#DEFAULTTAG'; // Asegurarse que clashTag se extrae del friendLink o se maneja

    const newUser: User = {
      id: `user-${Date.now()}`, // En un backend real, la BD generaría el ID.
      username: data.username,
      phone: data.phone,
      password: data.password, // En un backend real, esto estaría hasheado.
      clashTag: clashTagValue,
      nequiAccount: data.phone, // Asumiendo que el teléfono es también la cuenta Nequi para simplificar.
      friendLink: data.friendLink,
      avatarUrl: `https://placehold.co/100x100.png?text=${data.username[0]?.toUpperCase() || 'R'}`,
      balance: 0, // Saldo inicial
    };

    // En un backend real, aquí se guardaría newUser en la base de datos.
    // Por ahora, solo retornamos el objeto User creado.
    return { user: newUser, error: null };
  } catch (e) {
    // console.error("Error en registerUserAction:", e);
    return { user: null, error: 'Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.' };
  }
}

export async function loginUserAction(
  loginData: LoginFormValues,
  clientStoredUser?: User // El cliente envía el usuario que tiene en su localStorage
): Promise<{ user: User; error?: null } | { user: null; error: string }> {
  try {
    // Lógica para el usuario de demostración
    if (loginData.phone === "0000000") {
      if (loginData.password === "0000") {
        const demoUser: User = {
          id: 'user-123-demo',
          phone: loginData.phone,
          password: loginData.password, // En un backend real, compararíamos hashes
          username: 'DemoUser',
          clashTag: 'Player#ABC',
          nequiAccount: '3001112233',
          avatarUrl: 'https://placehold.co/100x100.png?text=D',
          balance: 50000,
          friendLink: 'https://link.clashroyale.com/invite/friend/es?tag=DEMOTAG&token=demotoken&platform=android',
        };
        return { user: demoUser, error: null };
      } else {
        return { user: null, error: "Contraseña incorrecta para el usuario Demo." };
      }
    }

    // Lógica para usuarios registrados (simulada, usando clientStoredUser)
    if (clientStoredUser) {
      if (clientStoredUser.phone === loginData.phone && clientStoredUser.password === loginData.password) {
        // En un backend real, se recuperaría el usuario de la BD por 'phone' y se compararía el hash de la contraseña.
        return { user: clientStoredUser, error: null };
      } else if (clientStoredUser.phone === loginData.phone) {
        return { user: null, error: "Contraseña incorrecta." };
      }
    }

    return { user: null, error: "Usuario no encontrado o credenciales incorrectas. Por favor, regístrate si eres nuevo." };

  } catch (e) {
    // console.error("Error en loginUserAction:", e);
    return { user: null, error: 'Ocurrió un error durante el inicio de sesión. Por favor, inténtalo de nuevo.' };
  }
}
