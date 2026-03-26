export interface Chat {
  id: string;
  customerId: string;
  staffId: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
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
  senderId: string;
  senderName?: string;
  content: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
}

export interface SendMessageRequest {
  content: string;
  chatId: string;
  attachments?: string[];
}

export interface ConnectWebSocketHandlers {
  onMessageReceived?: (message: Message) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: unknown) => void;
}
