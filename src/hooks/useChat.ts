import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '../services/chatService';
import type { Chat, UseChatState, UseChatActions } from '@/types';
import { api } from '@/services/apiClient';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

export const useChat = (): UseChatState & UseChatActions => {
  const [state, setState] = useState<UseChatState>({
    chats: [],
    currentChat: null,
    messages: [],
    loading: false,
    error: null,
    isConnected: false,
  });

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      chatService.disconnectWebSocket();
    };
  }, []);

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
        messages: messages || [],
      }));

      // Mark as read
      await chatService.markAsRead(chatId);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setState((prev) => ({
        ...prev,
        error: (err as Error).message || 'Failed to load messages',
      }));
    }
  }, []);

  const selectChat = useCallback(
    async (chatId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        // Disconnect from previous chat
        if (state.currentChat) {
          chatService.leaveChat(state.currentChat.id);
        }

        const chat = await chatService.getChat(chatId);
        if (chat) {
          setState((prev) => ({ ...prev, currentChat: chat }));

          // Load messages FIRST, before connecting WebSocket
          // This prevents messages from being added twice
          await loadMessages(chatId);

          // Get userId from auth store
          const authStore = useAuthStore.getState();
          let userId = authStore.user?.id;

          // If not in store, try to fetch from /auth/me endpoint
          if (!userId) {
            try {
              const meResponse = await api.get('/auth/me');
              const user = meResponse.data?.data || meResponse.data?.user;
              if (user?.id) {
                userId = user.id;
                // Update the auth store with the fetched user
                authStore.setAuth(user);
              }
            } catch (err) {
              console.error('Failed to fetch user from /auth/me:', err);
            }
          }

          if (userId) {
            // Now connect to WebSocket AFTER loading historical messages
            // Any new messages arriving via Socket.IO will be added here
            chatService.connectWebSocket(chatId, userId, {
              onMessageReceived: (message) => {
                if (message.chatId !== chatId) {
                  return;
                }

                setState((prev) => {
                  // Deduplicate: only add if message doesn't already exist
                  const messageExists = prev.messages.some((msg) => msg.id === message.id);
                  if (messageExists) {
                    return prev;
                  }
                  return {
                    ...prev,
                    messages: [...prev.messages, message],
                    error: null,
                  };
                });
              },
              onConnectionChange: (connected) => {
                setState((prev) => ({ ...prev, isConnected: connected }));
              },
            });
          } else {
            console.warn('User ID not available for WebSocket connection');
            setState((prev) => ({ ...prev, isConnected: false }));
          }
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: (err as Error).message || 'Failed to select chat',
        }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [loadMessages, state.currentChat]
  );

  const sendMessage = useCallback(
    async (text: string, chatId?: string) => {
      const targetChatId = chatId || state.currentChat?.id;

      if (!targetChatId) {
        return;
      }

      if (!text.trim()) {
        return;
      }

      try {
        // Send message via REST API but don't add to state optimistically
        // The Socket.IO event will handle adding it to state
        const sentMessage = await chatService.sendMessage(targetChatId, text);

        // Fallback: if websocket event is delayed or not delivered, append
        // the REST response message once (deduplicated by id).
        if (sentMessage) {
          setState((prev) => {
            const messageExists = prev.messages.some((msg) => msg.id === sentMessage.id);
            if (messageExists) {
              return prev;
            }
            return {
              ...prev,
              messages: [...prev.messages, sentMessage],
              error: null,
            };
          });
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: (err as Error).message || 'Failed to send message',
        }));
      }
    },
    [state.currentChat]
  );

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
        // Try authStore first
        let customerId = useAuthStore.getState().user?.id;

        // If not in authStore, try to get current user from API
        if (!customerId) {
          try {
            // Try to get current user from auth endpoint
            // The api client from authService will automatically attach the JWT token
            const currentUserResponse = await api.get('/auth/me');
            const currentUser = currentUserResponse.data?.data || currentUserResponse.data;
            customerId = currentUser?.id || currentUser?.sub;
          } catch (authError) {
            console.error('Failed to get current user:', authError);
            toast.error('Failed to authenticate. Please log in again.');
            return null;
          }
        }

        if (!customerId) {
          console.error('Could not determine user ID');
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
    chatService.disconnectWebSocket();
    setState((prev) => ({
      ...prev,
      currentChat: null,
      messages: [],
      isConnected: false,
    }));
  }, []);

  return {
    ...state,
    loadChats,
    selectChat,
    loadMessages,
    sendMessage,
    markAsRead,
    createChat,
    disconnect,
  };
};
