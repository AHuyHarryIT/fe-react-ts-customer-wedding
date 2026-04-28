export interface Chat {
  id: string;
  customerId: string;
  staffId: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
  aiEnabled?: boolean;
  staffName?: string;
  staffAvatar?: string;
  lastMessage?: string;
  unreadCount?: number;
  customer?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface Message {
  id: string;
  chatId: string;
  senderId?: string;
  senderType?: 'CUSTOMER' | 'STAFF' | 'AI';
  senderName?: string;
  content: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  clientMessageId?: string;
  sendStatus?: 'sending' | 'sent' | 'failed';
}

export interface SendMessageRequest {
  content: string;
  chatId: string;
  attachments?: string[];
}

export type ChatConnectionStatus = 'connected' | 'reconnecting' | 'disconnected' | 'recovered';

export type ChatComposerState = 'idle' | 'typing' | 'sending' | 'blocked';

export interface ConnectWebSocketHandlers {
  onMessageReceived?: (message: Message) => void;
  onConnectionChange?: (connected: boolean) => void;
  onConnectionStatusChange?: (status: ChatConnectionStatus) => void;
  onError?: (error: unknown) => void;
}
