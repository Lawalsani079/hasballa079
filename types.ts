
export type RequestStatus = 'En attente' | 'Validé' | 'Rejeté';
export type RequestType = 'Dépôt' | 'Retrait';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
}

export interface TransactionRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: RequestType;
  amount: string;
  method: string;
  bookmaker: string;
  bookmakerId: string;
  withdrawCode?: string;
  proofImage?: string;
  status: RequestStatus;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  isAdmin: boolean;
  createdAt: number;
}

export interface BannerItem {
  id: string;
  image: string;
}
