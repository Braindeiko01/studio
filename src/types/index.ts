
// Tipos del Backend (basados en OpenAPI)
export interface BackendUsuarioDto {
  id?: string; // UUID generado por el backend, presente en respuestas
  nombre: string;
  email: string;
  telefono: string; // Pattern: ^\\+?\\d{7,15}$
  tagClash: string; // Pattern: ^#?[A-Z0-9]{5,12}$
  linkAmistad?: string; // Pattern: ^(https://link\.clashroyale\.com/invite/friend\\?tag=[A-Z0-9]+)?$
  saldo?: number; // minimum: 0.0
  reputacion?: number; // integer
}

export interface BackendTransaccionRequestDto {
  usuarioId: string; // UUID del usuario del backend
  monto: number;
  tipo: "DEPOSITO" | "RETIRO" | "PREMIO";
}

export interface BackendTransaccionResponseDto {
  id: string; // UUID de la transacción
  usuarioId: string; // UUID del usuario del backend
  monto: number;
  tipo: "DEPOSITO" | "RETIRO" | "PREMIO";
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  creadoEn: string; // date-time
}

export interface BackendApuestaRequestDto {
  jugador1Id: string; // UUID del usuario del backend
  jugador2Id?: string; // UUID del usuario del backend (opcional)
  monto: number;
  modoJuego: string;
}

export interface BackendApuestaResponseDto {
  id: string; // UUID de la apuesta
  jugador1Id?: string; // UUID del backend
  jugador2Id?: string; // UUID del backend
  monto: number;
  modoJuego: string;
  estado: "PENDIENTE" | "EMPAREJADA" | "EN_PROGRESO" | "FINALIZADA" | "CANCELADA";
  creadoEn: string; // date-time
}

export interface BackendPartidaRequestDto {
  apuestaId: string; // UUID de la apuesta
  ganadorId: string; // UUID del usuario del backend
  resultadoJson?: string;
}

export interface BackendPartidaResponseDto {
  id: string; // UUID de la partida
  apuestaId: string; // UUID de la apuesta
  ganadorId?: string; // UUID del usuario del backend
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
  id: string; // Representa el ID del usuario generado por el BACKEND (UUID)
  googleId?: string; // ID de Google, guardado para referencia del frontend.
  username: string; // Mapeado desde 'nombre' del backend/Google
  email: string;
  phone: string;
  clashTag: string; // Con #, ej: #P0LYGJU
  nequiAccount: string; // Probablemente el mismo que 'phone'
  avatarUrl?: string;
  balance: number;
  friendLink?: string;
  reputacion?: number;
}

// Para el formulario de completar perfil después del login con Google
export interface CompleteProfileFormValues {
  username: string; // Nombre de usuario que el usuario elige/confirma
  phone: string;    // Teléfono que también se usa para Nequi
  friendLink: string;
}

// Valores obtenidos de la simulación de Google Auth
export interface GoogleAuthValues {
  googleId: string;
  email: string;
  username: string; // 'nombre' de Google, usado para pre-llenar
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
  clashTag: string; // Derivado del friendLink
};


export type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type MatchResult = 'win' | 'loss' | 'draw';

export interface Bet {
  id: string; // ID de la apuesta (del backend)
  userId: string; // ID del usuario del backend (UUID)
  matchId?: string; // Si se mapea a una partida/chat local
  amount: number;
  opponentTag?: string;
  opponentId?: string; // ID del oponente del backend (UUID)
  matchDate: string;
  result?: MatchResult;
  status: BackendApuestaResponseDto['estado'];
  modoJuego: string;
  screenshotUrl?: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string; // ID del usuario del backend (UUID) o 'system'
  text: string;
  timestamp: string;
  isSystemMessage?: boolean;
}
