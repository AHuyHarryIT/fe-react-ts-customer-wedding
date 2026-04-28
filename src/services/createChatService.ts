import { API_BASE_URL, api } from './apiClient';
import io, { Socket } from 'socket.io-client';
import type { Chat, ConnectWebSocketHandlers, Message } from '@/types/chat';

const WS_URL = (() => {
  try {
    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
    return new URL(API_BASE_URL, baseOrigin).origin;
  } catch {
    return API_BASE_URL;
  }
})();

export interface ChatServiceContract {
  createChat: (customerId: string, bookingId?: string) => Promise<Chat | null>;
  getChats: (skip?: number, take?: number) => Promise<Chat[]>;
  getChat: (chatId: string) => Promise<Chat | null>;
  getMessages: (chatId: string, skip?: number, take?: number) => Promise<Message[]>;
  markAsRead: (chatId: string) => Promise<void>;
  connectWebSocket: (chatId: string, userId: string, handlers?: ConnectWebSocketHandlers) => void;
  sendWebSocketMessage: (chatId: string, content: string, clientMessageId?: string) => boolean;
  leaveChat: (chatId: string) => void;
  disconnectWebSocket: () => void;
  isWebSocketConnected: () => boolean;
}

type ChatSocketEvents = {
  joinEvent: 'join_staff_chat' | 'join_ai_thread';
  leaveEvent: 'leave_staff_chat' | 'leave_ai_thread';
  sendEvent: 'send_staff_message' | 'send_ai_message';
  receiveEvent: 'staff_message_received' | 'ai_message_received';
  idField: 'chatId' | 'threadId';
};

const resolveSocketEvents = (namespace: string): ChatSocketEvents => {
  if (namespace === '/ai-chat') {
    return {
      joinEvent: 'join_ai_thread',
      leaveEvent: 'leave_ai_thread',
      sendEvent: 'send_ai_message',
      receiveEvent: 'ai_message_received',
      idField: 'threadId',
    };
  }

  return {
    joinEvent: 'join_staff_chat',
    leaveEvent: 'leave_staff_chat',
    sendEvent: 'send_staff_message',
    receiveEvent: 'staff_message_received',
    idField: 'chatId',
  };
};

export class ApiChatService implements ChatServiceContract {
  private socket: Socket | null = null;
  private readonly apiResourcePath: string;
  private readonly socketNamespace: string;

  constructor(apiResourcePath: string, socketNamespace: string) {
    this.apiResourcePath = apiResourcePath;
    this.socketNamespace = socketNamespace;
  }

  private toMessage(data: Message): Message {
    if (data.chatId) {
      return data;
    }

    const candidate = data as Message & { threadId?: string };
    if (candidate.threadId) {
      return {
        ...data,
        chatId: candidate.threadId,
      };
    }

    return data;
  }

  private emitJoin(chatId: string): void {
    const { joinEvent, idField } = resolveSocketEvents(this.socketNamespace);
    this.socket?.emit(joinEvent, { [idField]: chatId });
  }

  private emitLeave(chatId: string): void {
    const { leaveEvent, idField } = resolveSocketEvents(this.socketNamespace);
    this.socket?.emit(leaveEvent, { [idField]: chatId });
  }

  private emitSend(chatId: string, content: string, clientMessageId?: string): void {
    const { sendEvent, idField } = resolveSocketEvents(this.socketNamespace);
    this.socket?.emit(sendEvent, {
      [idField]: chatId,
      content,
      ...(clientMessageId ? { clientMessageId } : {}),
    });
  }

  private registerIncomingMessageHandler(handlers?: ConnectWebSocketHandlers): void {
    const { receiveEvent } = resolveSocketEvents(this.socketNamespace);
    this.socket?.on(receiveEvent, (data: Message) => {
      handlers?.onMessageReceived?.(this.toMessage(data));
    });
  }

  private registerSocketErrorHandler(handlers?: ConnectWebSocketHandlers): void {
    this.socket?.on('staff_error', (error: unknown) => {
      handlers?.onConnectionChange?.(false);
      handlers?.onError?.(error);
    });

    this.socket?.on('ai_error', (error: unknown) => {
      handlers?.onConnectionChange?.(false);
      handlers?.onError?.(error);
    });
  }

  async createChat(customerId: string, bookingId?: string): Promise<Chat | null> {
    try {
      const response = await api.post(this.apiResourcePath, {
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
      const response = await api.get(this.apiResourcePath, {
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
      const response = await api.get(`${this.apiResourcePath}/${chatId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to fetch chat:', error);
      return null;
    }
  }

  async getMessages(chatId: string, skip: number = 0, take: number = 50): Promise<Message[]> {
    try {
      const response = await api.get(`${this.apiResourcePath}/${chatId}/messages`, {
        params: { skip, take },
      });

      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : data.messages || [];
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  }

  async markAsRead(chatId: string): Promise<void> {
    try {
      await api.put(`${this.apiResourcePath}/${chatId}/messages/read`);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }

  connectWebSocket(chatId: string, userId: string, handlers?: ConnectWebSocketHandlers): void {
    if (this.socket?.connected) {
      this.emitJoin(chatId);
      handlers?.onConnectionChange?.(true);
      handlers?.onConnectionStatusChange?.('connected');
      return;
    }

    let hasConnectedOnce = false;

    this.socket = io(`${WS_URL}${this.socketNamespace}`, {
      auth: {
        userId,
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
      this.emitJoin(chatId);
    });

    this.socket.io.on('reconnect_attempt', () => {
      handlers?.onConnectionStatusChange?.('reconnecting');
    });

    this.registerIncomingMessageHandler(handlers);
    this.registerSocketErrorHandler(handlers);

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

  sendWebSocketMessage(chatId: string, content: string, clientMessageId?: string): boolean {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected');
      return false;
    }

    this.emitSend(chatId, content, clientMessageId);

    return true;
  }

  leaveChat(chatId: string): void {
    if (this.socket?.connected) {
      this.emitLeave(chatId);
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
