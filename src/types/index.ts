
// Tipos del Backend (basados en OpenAPI)

export interface BackendUsuarioDto {
  id?: string; // Este será el googleId cuando se comunique con el backend
  nombre: string;
  email: string;
  telefono: string; // Pattern: ^\\+?\\d{7,15}$
  tagClash: string; // Pattern: ^#?[A-Z0-9]{5,12}$
  linkAmistad?: string; // Pattern: ^(https://link\.clashroyale\.com/invite/friend\\?tag=[A-Z0-9]+)?$
  saldo?: number; // minimum: 0.0
  reputacion?: number;
}

export interface BackendTransaccionRequestDto {
  usuarioId: string; // UUID (será el googleId)
  monto: number;
  tipo: "DEPOSITO" | "RETIRO" | "PREMIO";
}

export interface BackendTransaccionResponseDto {
  id: string; // UUID de la transacción
  usuarioId: string; // UUID (googleId)
  monto: number;
  tipo: "DEPOSITO" | "RETIRO" | "PREMIO";
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  creadoEn: string; // date-time
}

export interface BackendApuestaRequestDto {
  jugador1Id: string; // UUID (googleId)
  jugador2Id?: string; // UUID (googleId - opcional si es una apuesta abierta)
  monto: number;
  modoJuego: string;
}

export interface BackendApuestaResponseDto {
  id: string; // UUID de la apuesta
  jugador1Id?: string; // Añadido para consistencia
  jugador2Id?: string; // Añadido para consistencia
  monto: number;
  modoJuego: string;
  estado: "PENDIENTE" | "EMPAREJADA" | "EN_PROGRESO" | "FINALIZADA" | "CANCELADA";
  creadoEn: string; // date-time
}

export interface BackendPartidaRequestDto {
  apuestaId: string; // UUID de la apuesta
  ganadorId: string; // UUID (googleId)
  resultadoJson?: string;
}

export interface BackendPartidaResponseDto {
  id: string; // UUID de la partida
  apuestaId: string; // UUID de la apuesta
  ganadorId?: string; // UUID (googleId)
  validada: boolean;
  validadaEn?: string; // date-time
}

export interface BackendMatchResultDto {
    apuesta1Id: string; // UUID
    apuesta2Id: string; // UUID
    monto: number;
    modoJuego: string;
}


// Tipos de la Aplicación Frontend

export interface User {
  id: string; // Representa el googleId
  username: string; // Mapeado desde 'nombre' de Google/backend
  email: string;
  phone: string; // Campo adicional de la app
  clashTag: string; // Con #, ej: #P0LYGJU (campo adicional de la app)
  nequiAccount: string; // Probablemente el mismo que 'phone' (campo adicional de la app)
  avatarUrl?: string; // Puede venir de Google o ser placeholder
  balance: number;
  friendLink?: string; // Campo adicional de la app
  reputacion?: number;
  // No hay password con Google Sign-In
}

// Para el formulario de completar perfil después del login con Google
export interface CompleteProfileFormValues {
  phone: string;
  friendLink: string;
  clashTag?: string; // Se puede extraer del friendLink
}

// Valores para el proceso de login/registro con Google
export interface GoogleAuthValues {
  googleId: string;
  email: string;
  username: string; // 'nombre' de Google
  avatarUrl?: string;
}


export type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type MatchResult = 'win' | 'loss' | 'draw';

export interface Bet {
  id: string;
  userId: string; // googleId
  matchId?: string;
  amount: number;
  opponentTag?: string;
  opponentId?: string; // googleId del oponente
  matchDate: string;
  result?: MatchResult;
  status: BackendApuestaResponseDto['estado'];
  modoJuego: string;
  screenshotUrl?: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string; // googleId o 'system'
  text: string;
  timestamp: string;
  isSystemMessage?: boolean;
}

// Ya no se usa el LoginFormValues tradicional
// export interface LoginFormValues {
//   phone: string;
//   password?: string;
// }

// RegisterFormValues se transforma en CompleteProfileFormValues que se usa *después* de la autenticación con Google
// y se combina con GoogleAuthValues.
export type RegisterWithGoogleData = GoogleAuthValues & CompleteProfileFormValues;

    