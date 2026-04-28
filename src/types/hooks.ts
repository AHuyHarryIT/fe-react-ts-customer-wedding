import type { Chat, Message, ChatComposerState, ChatConnectionStatus } from './chat';

export interface UseChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  loadingOlderMessages: boolean;
  hasMoreMessages: boolean;
  error: string | null;
  isConnected: boolean;
  connectionStatus: ChatConnectionStatus;
  composerState: ChatComposerState;
  sendDisabledReason: string | null;
  sendFailure: string | null;
  reconnectNotice: string | null;
}

export interface UseChatActions {
  loadChats: () => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  loadOlderMessages: (chatId?: string) => Promise<void>;
  sendMessage: (content: string, chatId?: string) => Promise<boolean>;
  markAsRead: (chatId: string) => Promise<void>;
  createChat: (bookingId?: string) => Promise<Chat | null>;
  disconnect: () => void;
  setComposerDraft: (draft: string) => void;
  clearSendFailure: () => void;
}
