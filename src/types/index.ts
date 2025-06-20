
// Tipos del Backend (basados en OpenAPI y adaptados para googleId como PK)
export interface BackendUsuarioDto {
  id?: string; // Ahora representa el googleId, enviado en registro y recibido en respuestas
  nombre: string;
  email: string;
  telefono: string; // Pattern: ^\\+?\\d{7,15}$
  tagClash: string; // Pattern: ^#?[A-Z0-9]{5,12}$
  linkAmistad?: string; // Pattern: ^(https://link\.clashroyale\.com/invite/friend\\?tag=[A-Z0-9]+)?$
  saldo?: number; // minimum: 0.0
  reputacion?: number; // integer
}

export interface BackendTransaccionRequestDto {
  usuarioId: string; // googleId del usuario
  monto: number;
  tipo: "DEPOSITO" | "RETIRO" | "PREMIO";
}

export interface BackendTransaccionResponseDto {
  id: string; // UUID de la transacción (propio del backend)
  usuarioId: string; // googleId del usuario
  monto: number;
  tipo: "DEPOSITO" | "RETIRO" | "PREMIO";
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  creadoEn: string; // date-time
}

export interface BackendApuestaRequestDto {
  jugador1Id: string; // googleId del usuario
  jugador2Id?: string; // googleId del usuario (opcional)
  monto: number;
  modoJuego: string;
}

export interface BackendApuestaResponseDto {
  id: string; // UUID de la apuesta (propio del backend)
  jugador1Id?: string; // googleId
  jugador2Id?: string; // googleId
  monto: number;
  modoJuego: string;
  estado: "PENDIENTE" | "EMPAREJADA" | "EN_PROGRESO" | "FINALIZADA" | "CANCELADA";
  creadoEn: string; // date-time
}

export interface BackendPartidaRequestDto {
  apuestaId: string; // UUID de la apuesta
  ganadorId: string; // googleId del usuario
  resultadoJson?: string;
}

export interface BackendPartidaResponseDto {
  id: string; // UUID de la partida
  apuestaId: string; // UUID de la apuesta
  ganadorId?: string; // googleId del usuario
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
  id: string; // Representa el googleId, es el identificador principal
  username: string;
  email: string;
  phone: string;
  clashTag: string;
  nequiAccount: string;
  avatarUrl?: string;
  balance: number;
  friendLink?: string;
  reputacion?: number;
}

// Para el formulario de completar perfil después del login con Google
export interface CompleteProfileFormValues {
  username: string;
  phone: string;
  friendLink: string;
}

// Valores obtenidos de la simulación de Google Auth
export interface GoogleAuthValues {
  googleId: string;
  email: string;
  username: string;
  avatarUrl?: string;
}

// Datos completos para registrarse: combina GoogleAuthValues y CompleteProfileFormValues
export type RegisterWithGoogleData = {
  googleId: string;
  email: string;
  username: string;
  avatarUrl?: string;
  phone: string;
  friendLink: string;
  clashTag: string;
};


export type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type MatchResult = 'win' | 'loss' | 'draw';

export interface Bet {
  id: string; // ID de la apuesta (del backend, UUID)
  userId: string; // googleId del usuario
  matchId?: string; // Si se mapea a una partida/chat local
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
  matchId: string; // Este es el ID de la apuesta del backend (UUID)
  senderId: string; // googleId del usuario o 'system'
  text: string;
  timestamp: string;
  isSystemMessage?: boolean;
}
