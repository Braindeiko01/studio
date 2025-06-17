
export interface User {
  id: string;
  phone: string;
  username: string; 
  clashTag: string;
  nequiAccount: string;
  avatarUrl?: string; 
  balance: number; 
  friendLink?: string; 
}

export type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type MatchResult = 'win' | 'loss' | 'draw'; 

export interface Match {
  id: string;
  player1Id: string;
  player2Id?: string; 
  amount: number; 
  status: MatchStatus;
  createdAt: string; 
  updatedAt: string; 
  chatId?: string;
  winnerId?: string;
  resultScreenshotPlayer1Url?: string; 
  resultScreenshotPlayer2Url?: string;
}

export interface Bet {
  id: string;
  userId: string;
  matchId: string;
  amount: number; 
  result?: MatchResult; 
  opponentTag?: string; 
  matchDate: string; 
  screenshotUrl?: string; // Added field for screenshot URL/placeholder
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: string; 
  isSystemMessage?: boolean; 
}
