import { API_BASE_URL, api } from './apiClient';
import io, { Socket } from 'socket.io-client';
import type { Chat, Message, ConnectWebSocketHandlers } from '@/types/chat';

const WS_URL = (() => {
  try {
    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
    return new URL(API_BASE_URL, baseOrigin).origin;
  } catch {
    return API_BASE_URL;
  }
})();

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
      throw error;
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
      handlers?.onConnectionStatusChange?.('connected');
      return;
    }

    let hasConnectedOnce = false;

    this.socket = io(`${WS_URL}/chat`, {
      auth: {
        userId: userId,
      },
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      handlers?.onConnectionChange?.(true);
      handlers?.onConnectionStatusChange?.(hasConnectedOnce ? 'recovered' : 'connected');
      hasConnectedOnce = true;
      this.socket?.emit('join_chat', { chatId });
    });

    this.socket.io.on('reconnect_attempt', () => {
      handlers?.onConnectionStatusChange?.('reconnecting');
    });

    this.socket.on('message_received', (data: Message) => {
      handlers?.onMessageReceived?.(data);
    });

    this.socket.on('disconnect', () => {
      handlers?.onConnectionChange?.(false);
      handlers?.onConnectionStatusChange?.('disconnected');
    });

    this.socket.on('error', (error: unknown) => {
      handlers?.onConnectionChange?.(false);
      handlers?.onError?.(error);
    });

    this.socket.on('connect_error', (error: unknown) => {
      handlers?.onConnectionChange?.(false);
      handlers?.onConnectionStatusChange?.('reconnecting');
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
