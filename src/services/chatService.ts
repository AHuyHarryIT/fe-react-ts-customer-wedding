import { api } from './authService';
import io, { Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

interface ConnectWebSocketHandlers {
  onMessageReceived?: (message: Message) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: unknown) => void;
}

class ChatService {
  private socket: Socket | null = null;

  async createChat(customerId: string, bookingId?: string): Promise<Chat | null> {
    try {
      const response = await api.post('/chats', {
        customerId,
        bookingId,
      });

      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to create chat:', error);
      return null;
    }
  }

  async getChats(skip: number = 0, take: number = 20): Promise<Chat[]> {
    try {
      const response = await api.get('/chats', {
        params: { skip, take },
      });

      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : data.chats || [];
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      return [];
    }
  }

  async getChat(chatId: string): Promise<Chat | null> {
    try {
      const response = await api.get(`/chats/${chatId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to fetch chat:', error);
      return null;
    }
  }

  async getMessages(chatId: string, skip: number = 0, take: number = 50): Promise<Message[]> {
    try {
      const response = await api.get(`/chats/${chatId}/messages`, {
        params: { skip, take },
      });

      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : data.messages || [];
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  }

  async sendMessage(chatId: string, text: string, attachments?: string[]): Promise<Message | null> {
    try {
      const response = await api.post(`/chats/${chatId}/messages`, {
        content: text,
        attachments,
      });

      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      return null;
    }
  }

  async markAsRead(chatId: string): Promise<void> {
    try {
      await api.put(`/chats/${chatId}/messages/read`);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }

  // WebSocket Connection Management
  connectWebSocket(chatId: string, userId: string, handlers?: ConnectWebSocketHandlers): void {
    if (this.socket?.connected) {
      this.socket.emit('join_chat', { chatId });
      handlers?.onConnectionChange?.(true);
      return;
    }

    this.socket = io(`${WS_URL}/chat`, {
      auth: {
        userId: userId,
      },
      withCredentials: true, // Include cookies with WebSocket
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      handlers?.onConnectionChange?.(true);
      this.socket?.emit('join_chat', { chatId });
    });

    this.socket.on('message_received', (data: Message) => {
      handlers?.onMessageReceived?.(data);
    });

    this.socket.on('typing', (data: { userId: string; isTyping: boolean }) => {
      console.log('User typing:', data);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      handlers?.onConnectionChange?.(false);
    });

    this.socket.on('error', (error: unknown) => {
      console.error('WebSocket error:', error);
      handlers?.onConnectionChange?.(false);
      handlers?.onError?.(error);
    });

    this.socket.on('connect_error', (error: unknown) => {
      console.error('WebSocket connect error:', error);
      handlers?.onConnectionChange?.(false);
      handlers?.onError?.(error);
    });
  }

  sendWebSocketMessage(chatId: string, message: Message): void {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.emit('send_message', {
      chatId,
      message,
    });
  }

  leaveChat(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_chat', { chatId });
    }
  }

  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isWebSocketConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const chatService = new ChatService();
