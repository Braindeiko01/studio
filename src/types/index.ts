export interface User {
  id: string;
  phone: string;
  clashTag: string;
  nequiAccount: string;
  avatarUrl?: string; // URL to placeholder or actual avatar
  balance: number; // in COP
}

export type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type MatchResult = 'win' | 'loss' | 'draw'; // 'draw' might not apply or need special handling

export interface Match {
  id: string;
  player1Id: string;
  player2Id?: string; // Becomes defined when matched
  amount: number; // Fixed at 6000 COP
  status: MatchStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  chatId?: string;
  winnerId?: string;
  resultScreenshotPlayer1?: string; // URL or base64 placeholder
  resultScreenshotPlayer2?: string;
}

export interface Bet {
  id: string;
  userId: string;
  matchId: string;
  amount: number; // Should be same as Match.amount
  result?: MatchResult; // win/loss for this user
  opponentTag?: string; // For display in history
  matchDate: string; // ISO date string
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: string; // ISO date string
  isSystemMessage?: boolean; // For messages like "Player X shared friend link"
}
