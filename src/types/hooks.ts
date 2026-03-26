import type { Chat, Message } from './chat';

export interface UseChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
}

export interface UseChatActions {
  loadChats: () => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (content: string, chatId?: string) => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  createChat: (bookingId?: string) => Promise<Chat | null>;
  disconnect: () => void;
}
