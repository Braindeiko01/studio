

// Tipos del Backend (basados en OpenAPI)

export interface BackendUsuarioDto {
  id?: string; // Este será el googleId cuando se comunique con el backend
  nombre: string; // Este es el 'username' de Google
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
  phone: string; 
  clashTag: string; // Con #, ej: #P0LYGJU
  nequiAccount: string; // Probablemente el mismo que 'phone'
  avatarUrl?: string;
  balance: number;
  friendLink?: string;
  reputacion?: number;
}

// Para el formulario de completar perfil después del login con Google (simplificado)
export interface CompleteProfileFormValues {
  phone: string;
  friendLink: string;
  // clashTag no es un campo del formulario, se deriva del friendLink
}

// Valores para el proceso de login/registro con Google
export interface GoogleAuthValues {
  googleId: string;
  email: string;
  username: string; // 'nombre' de Google
  avatarUrl?: string;
}

// Datos completos para registrarse usando Google y completando el perfil
export type RegisterWithGoogleData = {
  googleId: string;
  email: string;
  username: string; // 'nombre' de Google
  avatarUrl?: string;
  phone: string;
  friendLink: string;
  clashTag: string; // Derivado del friendLink en el cliente antes de llamar al action
};
    

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
    
