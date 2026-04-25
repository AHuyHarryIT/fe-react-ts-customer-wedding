import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '../services/chatService';
import type { Chat, Message, UseChatState, UseChatActions } from '@/types';
import { api } from '@/services/apiClient';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

const SEND_EMPTY_REASON = 'Enter a message to send.';
const SEND_NO_THREAD_REASON = 'Select a conversation first.';
const SEND_IN_PROGRESS_REASON = 'Sending message…';
const SEND_FAILURE_COPY = 'Message not sent. Check your connection and try again.';
const CREATE_CHAT_FAILED_REASON = 'Failed to start a conversation';
const RECONNECT_SUCCESS_COPY = 'Back online. Refreshing latest messages…';

const toEpoch = (value: string) => {
  const epoch = new Date(value).getTime();
  return Number.isFinite(epoch) ? epoch : 0;
};

const sortMessagesByCreatedAt = (messages: Message[]) =>
  [...messages].sort((a, b) => toEpoch(a.createdAt) - toEpoch(b.createdAt));

const normalizeMessages = (messages: Message[]) => {
  const deduped = new Map(messages.map((message) => [message.id, message]));
  return sortMessagesByCreatedAt(Array.from(deduped.values()));
};

const mergeMessages = (existing: Message[], incoming: Message[]) =>
  normalizeMessages([...existing, ...incoming]);

const getStatusCode = (error: unknown): number | null => {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const candidate = error as {
    response?: {
      status?: number;
    };
  };

  return typeof candidate.response?.status === 'number' ? candidate.response.status : null;
};

const getErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== 'object') {
    return 'Failed to send message';
  }

  const candidate = error as {
    message?: unknown;
    response?: {
      data?: {
        message?: unknown;
      };
    };
  };

  const payloadMessage = candidate.response?.data?.message;
  if (typeof payloadMessage === 'string' && payloadMessage.trim()) {
    return payloadMessage;
  }

  if (Array.isArray(payloadMessage)) {
    const first = payloadMessage.find((entry) => typeof entry === 'string' && entry.trim());
    if (typeof first === 'string') {
      return first;
    }
  }

  if (typeof candidate.message === 'string' && candidate.message.trim()) {
    return candidate.message;
  }

  return 'Failed to send message';
};

const resolveComposerState = (
  draft: string,
  activeChatId: string | null,
  blockedReason: string | null,
  isSending: boolean
): Pick<UseChatState, 'composerState' | 'sendDisabledReason'> => {
  if (isSending) {
    return {
      composerState: 'sending',
      sendDisabledReason: SEND_IN_PROGRESS_REASON,
    };
  }

  if (blockedReason) {
    return {
      composerState: 'blocked',
      sendDisabledReason: blockedReason,
    };
  }

  if (!activeChatId) {
    return {
      composerState: 'blocked',
      sendDisabledReason: SEND_NO_THREAD_REASON,
    };
  }

  if (!draft.trim()) {
    return {
      composerState: 'idle',
      sendDisabledReason: SEND_EMPTY_REASON,
    };
  }

  return {
    composerState: 'typing',
    sendDisabledReason: null,
  };
};

export const useChat = (): UseChatState & UseChatActions => {
  const [state, setState] = useState<UseChatState>({
    chats: [],
    currentChat: null,
    messages: [],
    loading: false,
    error: null,
    isConnected: false,
    connectionStatus: 'disconnected',
    composerState: 'blocked',
    sendDisabledReason: SEND_NO_THREAD_REASON,
    sendFailure: null,
    reconnectNotice: null,
  });

  const messageEndRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef('');
  const blockedReasonRef = useRef<string | null>(null);
  const currentChatRef = useRef<Chat | null>(null);
  const reconnectNoticeTimeoutRef = useRef<number | null>(null);

  const clearReconnectNoticeTimer = useCallback(() => {
    if (reconnectNoticeTimeoutRef.current !== null) {
      window.clearTimeout(reconnectNoticeTimeoutRef.current);
      reconnectNoticeTimeoutRef.current = null;
    }
  }, []);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      clearReconnectNoticeTimer();
      chatService.disconnectWebSocket();
    };
  }, [clearReconnectNoticeTimer]);

  useEffect(() => {
    currentChatRef.current = state.currentChat;
  }, [state.currentChat]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const loadChats = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const chats = await chatService.getChats();
      setState((prev) => ({
        ...prev,
        chats: chats || [],
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: (err as Error).message || 'Failed to load chats',
        loading: false,
      }));
    }
  }, []);

  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const messages = await chatService.getMessages(chatId);
      setState((prev) => ({
        ...prev,
        messages: mergeMessages(prev.messages, messages || []),
      }));

      await chatService.markAsRead(chatId);
      setState((prev) => ({
        ...prev,
        chats: prev.chats.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat)),
      }));
    } catch (err) {
      console.error('Failed to load messages:', err);
      setState((prev) => ({
        ...prev,
        error: (err as Error).message || 'Failed to load messages',
      }));
    }
  }, []);

  const setComposerDraft = useCallback((draft: string) => {
    draftRef.current = draft;

    setState((prev) => ({
      ...prev,
      ...resolveComposerState(draft, prev.currentChat?.id || null, blockedReasonRef.current, false),
    }));
  }, []);

  const clearSendFailure = useCallback(() => {
    setState((prev) => ({ ...prev, sendFailure: null }));
  }, []);

  const selectChat = useCallback(
    async (chatId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      clearReconnectNoticeTimer();

      try {
        if (currentChatRef.current) {
          chatService.leaveChat(currentChatRef.current.id);
        }

        chatService.disconnectWebSocket();

        const chat = await chatService.getChat(chatId);
        if (!chat) {
          return;
        }

        blockedReasonRef.current = null;
        currentChatRef.current = chat;

        setState((prev) => ({
          ...prev,
          currentChat: chat,
          messages: [],
          reconnectNotice: null,
          ...resolveComposerState(draftRef.current, chat.id, blockedReasonRef.current, false),
        }));

        await loadMessages(chatId);

        const authStore = useAuthStore.getState();
        let userId = authStore.user?.id;

        if (!userId) {
          try {
            const meResponse = await api.get('/auth/me');
            const user = meResponse.data?.data || meResponse.data?.user;
            if (user?.id) {
              userId = user.id;
              authStore.setAuth(user);
            }
          } catch (err) {
            console.error('Failed to fetch user from /auth/me:', err);
          }
        }

        if (!userId) {
          console.warn('User ID not available for WebSocket connection');
          setState((prev) => ({
            ...prev,
            isConnected: false,
            connectionStatus: 'disconnected',
          }));
          return;
        }

        chatService.connectWebSocket(chatId, userId, {
          onMessageReceived: (message) => {
            const activeChatId = currentChatRef.current?.id;
            if (message.chatId !== activeChatId) {
              return;
            }

            setState((prev) => {
              const messageExists = prev.messages.some((msg) => msg.id === message.id);
              if (messageExists) {
                return prev;
              }

              return {
                ...prev,
                messages: sortMessagesByCreatedAt([...prev.messages, message]),
                error: null,
              };
            });
          },
          onConnectionChange: (connected) => {
            setState((prev) => ({ ...prev, isConnected: connected }));
          },
          onConnectionStatusChange: (status) => {
            if (status === 'recovered') {
              setState((prev) => ({
                ...prev,
                isConnected: true,
                connectionStatus: 'recovered',
                reconnectNotice: RECONNECT_SUCCESS_COPY,
              }));

              void (async () => {
                await loadChats();
                const activeChatId = currentChatRef.current?.id;
                if (activeChatId) {
                  await loadMessages(activeChatId);
                }

                clearReconnectNoticeTimer();
                reconnectNoticeTimeoutRef.current = window.setTimeout(() => {
                  setState((prev) => ({
                    ...prev,
                    connectionStatus: 'connected',
                    reconnectNotice: null,
                  }));
                }, 1400);
              })();

              return;
            }

            setState((prev) => ({
              ...prev,
              connectionStatus: status,
              reconnectNotice: status === 'connected' ? null : prev.reconnectNotice,
            }));
          },
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: (err as Error).message || 'Failed to select chat',
        }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [clearReconnectNoticeTimer, loadChats, loadMessages]
  );

  const sendMessage = useCallback(async (text: string, chatId?: string) => {
    const targetChatId = chatId || currentChatRef.current?.id;

    draftRef.current = text;

    const currentComposer = resolveComposerState(
      text,
      targetChatId || null,
      blockedReasonRef.current,
      false
    );

    if (currentComposer.sendDisabledReason) {
      setState((prev) => ({
        ...prev,
        ...currentComposer,
      }));
      return false;
    }

    setState((prev) => ({
      ...prev,
      ...resolveComposerState(text, targetChatId || null, blockedReasonRef.current, true),
      sendFailure: null,
      error: null,
    }));

    try {
      const sentMessage = await chatService.sendMessage(targetChatId!, text);

      if (!sentMessage) {
        throw new Error('Failed to send message');
      }

      blockedReasonRef.current = null;
      draftRef.current = '';

      setState((prev) => {
        const messageExists = prev.messages.some((msg) => msg.id === sentMessage.id);
        const nextMessages = messageExists
          ? prev.messages
          : sortMessagesByCreatedAt([...prev.messages, sentMessage]);

        return {
          ...prev,
          messages: nextMessages,
          ...resolveComposerState(
            '',
            prev.currentChat?.id || null,
            blockedReasonRef.current,
            false
          ),
          sendFailure: null,
          error: null,
        };
      });

      return true;
    } catch (err) {
      const statusCode = getStatusCode(err);
      const backendMessage = getErrorMessage(err);

      if (statusCode === 403) {
        blockedReasonRef.current = backendMessage;
        setState((prev) => ({
          ...prev,
          ...resolveComposerState(text, targetChatId || null, blockedReasonRef.current, false),
          sendFailure: SEND_FAILURE_COPY,
        }));
        return false;
      }

      blockedReasonRef.current = null;
      setState((prev) => ({
        ...prev,
        ...resolveComposerState(text, targetChatId || null, blockedReasonRef.current, false),
        sendFailure: SEND_FAILURE_COPY,
        error: backendMessage,
      }));

      return false;
    }
  }, []);

  const markAsRead = useCallback(async (chatId: string) => {
    try {
      await chatService.markAsRead(chatId);
      setState((prev) => ({
        ...prev,
        chats: prev.chats.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat)),
      }));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  const createChat = useCallback(
    async (bookingId?: string): Promise<Chat | null> => {
      try {
        let customerId = useAuthStore.getState().user?.id;

        if (!customerId) {
          try {
            const currentUserResponse = await api.get('/auth/me');
            const currentUser = currentUserResponse.data?.data || currentUserResponse.data;
            customerId = currentUser?.id || currentUser?.sub;
          } catch (authError) {
            console.error('Failed to get current user:', authError);
            setState((prev) => ({
              ...prev,
              sendFailure: SEND_FAILURE_COPY,
              error: CREATE_CHAT_FAILED_REASON,
            }));
            toast.error('Failed to authenticate. Please log in again.');
            return null;
          }
        }

        if (!customerId) {
          console.error('Could not determine user ID');
          setState((prev) => ({
            ...prev,
            sendFailure: SEND_FAILURE_COPY,
            error: CREATE_CHAT_FAILED_REASON,
          }));
          toast.error('You must be logged in to create a chat');
          return null;
        }

        const newChat = await chatService.createChat(customerId, bookingId);
        if (newChat) {
          await loadChats();
        }
        return newChat;
      } catch (error) {
        console.error('Failed to create chat:', error);
        toast.error('Failed to create chat');
        return null;
      }
    },
    [loadChats]
  );

  const disconnect = useCallback(() => {
    clearReconnectNoticeTimer();
    blockedReasonRef.current = null;
    draftRef.current = '';
    chatService.disconnectWebSocket();

    setState((prev) => ({
      ...prev,
      currentChat: null,
      messages: [],
      isConnected: false,
      connectionStatus: 'disconnected',
      reconnectNotice: null,
      ...resolveComposerState('', null, blockedReasonRef.current, false),
      sendFailure: null,
    }));
  }, [clearReconnectNoticeTimer]);

  return {
    ...state,
    loadChats,
    selectChat,
    loadMessages,
    sendMessage,
    markAsRead,
    createChat,
    disconnect,
    setComposerDraft,
    clearSendFailure,
  };
};
