
// Tipos del Backend (basados en OpenAPI)

export interface BackendUsuarioDto {
  id?: string; // Asumiendo que el backend lo devuelve, aunque no esté en el requestBody schema
  nombre: string;
  email: string;
  telefono: string; // Pattern: ^\\+?\\d{7,15}$
  tagClash: string; // Pattern: ^#?[A-Z0-9]{5,12}$ (La app usa #TAG, el backend puede no querer el #)
  linkAmistad?: string; // Pattern: ^(https://link\.clashroyale\.com/invite/friend\\?tag=[A-Z0-9]+)?$
  saldo?: number; // minimum: 0.0
  reputacion?: number;
}

export interface BackendTransaccionRequestDto {
  usuarioId: string; // UUID
  monto: number;
  tipo: "DEPOSITO" | "RETIRO" | "PREMIO";
}

export interface BackendTransaccionResponseDto {
  id: string; // UUID
  usuarioId: string; // UUID
  monto: number;
  tipo: "DEPOSITO" | "RETIRO" | "PREMIO";
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  creadoEn: string; // date-time
}

export interface BackendApuestaRequestDto {
  jugador1Id: string; // UUID
  jugador2Id?: string; // UUID (opcional si es una apuesta abierta)
  monto: number;
  modoJuego: string; // Debería ser un enum en el backend, ej: "CLASSIC", "TRIPLE_DRAFT"
}

export interface BackendApuestaResponseDto {
  id: string; // UUID
  monto: number;
  modoJuego: string;
  estado: "PENDIENTE" | "EMPAREJADA" | "EN_PROGRESO" | "FINALIZADA" | "CANCELADA";
  creadoEn: string; // date-time
  // Faltarían jugador1Id, jugador2Id, etc. en la respuesta según la lógica de la app
}

export interface BackendPartidaRequestDto {
  apuestaId: string; // UUID
  ganadorId: string; // UUID
  resultadoJson?: string; // Para detalles adicionales de la partida
}

export interface BackendPartidaResponseDto {
  id: string; // UUID
  apuestaId: string; // UUID
  ganadorId?: string; // UUID (puede no haber ganador si se cancela o empata)
  validada: boolean;
  validadaEn?: string; // date-time
}

export interface BackendMatchResultDto {
    apuesta1Id: string; // UUID
    apuesta2Id: string; // UUID
    monto: number;
    modoJuego: string;
}


// Tipos de la Aplicación Frontend (ajustados)

export interface User {
  id: string; // UUID del backend
  phone: string;
  username: string; // Mapeado desde 'nombre' del backend
  email: string; // Nuevo campo
  clashTag: string; // Con #, ej: #P0LYGJU
  nequiAccount: string; // Probablemente el mismo que 'phone'
  password?: string; // Solo para simulación de login local si es necesario, no va al backend
  avatarUrl?: string; // Generado/gestionado por el cliente
  balance: number; // Mapeado desde 'saldo'
  friendLink?: string; // Mapeado desde 'linkAmistad'
  reputacion?: number;
}

export type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type MatchResult = 'win' | 'loss' | 'draw'; // Para el frontend

// Interfaz para Apuestas en el frontend, podría necesitar más campos que BackendApuestaResponseDto
export interface Bet {
  id: string; // UUID de la apuesta del backend
  userId: string; // El ID del usuario de la app
  matchId?: string; // ID de la partida si ya se jugó (BackendPartidaResponseDto.id)
  amount: number; // monto de la apuesta
  opponentTag?: string; // Para UI, se obtendría de los datos del oponente si está emparejada
  opponentId?: string;
  matchDate: string; // creadoEn de la apuesta
  result?: MatchResult; // Resultado para el usuario (win/loss)
  status: BackendApuestaResponseDto['estado']; // Estado de la apuesta del backend
  modoJuego: string;
  screenshotUrl?: string;
}

export interface ChatMessage {
  id: string;
  matchId: string; // Podría ser el ID de la apuesta o partida
  senderId: string;
  text: string;
  timestamp: string;
  isSystemMessage?: boolean;
}

// Para formularios, igual que antes pero se adaptarán
export interface RegisterFormValues {
  username: string; // Corresponderá a 'nombre' en el DTO
  email: string; // Nuevo campo
  phone: string;
  password?: string; // El backend no lo usa, pero el form lo puede tener para confirmación o UI
  clashTag?: string; // Se extraerá o ingresará, backend espera sin #
  friendLink: string; // Requerido
}

export interface LoginFormValues {
  phone: string;
  password?: string;
}
