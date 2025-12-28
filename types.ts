
export type RequestStatus = 'En attente' | 'Validé' | 'Rejeté';
export type RequestType = 'Dépôt' | 'Retrait' | 'Crypto';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
  referralCode: string;
  referredBy?: string;
  referralBalance: number;
  lastActive: number;
}

export interface TransactionRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: RequestType;
  amount: string;
  method: string;
  bookmaker?: string;
  bookmakerId?: string;
  withdrawCode?: string;
  cryptoType?: string;
  walletAddress?: string;
  proofImage?: string;
  status: RequestStatus;
  rejectionReason?: string;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
  read: boolean;
  link?: string;
  isPush?: boolean; // Indique si elle doit déclencher une alerte sonore/vibreur
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  image?: string;
  isAdmin: boolean;
  isAI?: boolean;
  createdAt: number;
}

export interface BannerItem {
  id: string;
  image: string;
}
