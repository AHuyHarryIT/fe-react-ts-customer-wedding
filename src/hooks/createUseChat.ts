import { useState, useEffect, useCallback, useRef } from 'react';
import type { Chat, Message, UseChatActions, UseChatState } from '@/types';
import { api } from '@/services/apiClient';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { ChatServiceContract } from '@/services/createChatService';

const SEND_EMPTY_REASON = 'Enter a message to send.';
const SEND_NO_THREAD_REASON = 'Select a conversation first.';
const SEND_IN_PROGRESS_REASON = 'Sending message…';
const SEND_FAILURE_COPY = 'Message not sent. Check your connection and try again.';
const CREATE_CHAT_FAILED_REASON = 'Failed to start a conversation';
const RECONNECT_SUCCESS_COPY = 'Back online. Refreshing latest messages…';
const INITIAL_MESSAGES_TAKE = 20;
const OLDER_MESSAGES_TAKE = 10;

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

export const createUseChat = (chatService: ChatServiceContract) => {
  return (): UseChatState & UseChatActions => {
    const [state, setState] = useState<UseChatState>({
      chats: [],
      currentChat: null,
      messages: [],
      loading: false,
      loadingOlderMessages: false,
      hasMoreMessages: false,
      error: null,
      isConnected: false,
      connectionStatus: 'disconnected',
      composerState: 'blocked',
      sendDisabledReason: SEND_NO_THREAD_REASON,
      sendFailure: null,
      reconnectNotice: null,
    });

    const draftRef = useRef('');
    const blockedReasonRef = useRef<string | null>(null);
    const currentChatRef = useRef<Chat | null>(null);
    const reconnectNoticeTimeoutRef = useRef<number | null>(null);
    const pendingMessagesRef = useRef<Map<string, { optimisticMessageId: string; chatId: string }>>(
      new Map()
    );
    const pendingMessageTimeoutsRef = useRef<Map<string, number>>(new Map());
    const loadedMessageCountRef = useRef(0);

    const clearReconnectNoticeTimer = useCallback(() => {
      if (reconnectNoticeTimeoutRef.current !== null) {
        window.clearTimeout(reconnectNoticeTimeoutRef.current);
        reconnectNoticeTimeoutRef.current = null;
      }
    }, []);

    const clearPendingMessageTimeout = useCallback((clientMessageId: string) => {
      const timeoutId = pendingMessageTimeoutsRef.current.get(clientMessageId);
      if (typeof timeoutId === 'number') {
        window.clearTimeout(timeoutId);
        pendingMessageTimeoutsRef.current.delete(clientMessageId);
      }
    }, []);

    const markPendingMessageFailed = useCallback(
      (clientMessageId: string) => {
        const pending = pendingMessagesRef.current.get(clientMessageId);
        if (!pending) {
          return;
        }

        clearPendingMessageTimeout(clientMessageId);
        pendingMessagesRef.current.delete(clientMessageId);

        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((message) =>
            message.id === pending.optimisticMessageId
              ? { ...message, sendStatus: 'failed' }
              : message
          ),
          sendFailure: SEND_FAILURE_COPY,
        }));
      },
      [clearPendingMessageTimeout]
    );

    const markMostRecentPendingMessageFailed = useCallback(() => {
      const activeChatId = currentChatRef.current?.id;
      if (!activeChatId) {
        return;
      }

      const pendingEntries = Array.from(pendingMessagesRef.current.entries());
      const recentPending = pendingEntries
        .reverse()
        .find(([, pending]) => pending.chatId === activeChatId);

      if (!recentPending) {
        return;
      }

      const [clientMessageId] = recentPending;
      markPendingMessageFailed(clientMessageId);
    }, [markPendingMessageFailed]);

    const acknowledgePendingMessage = useCallback(
      (incomingMessage: Message): Message => {
        const clientMessageId = incomingMessage.clientMessageId;
        if (!clientMessageId) {
          return incomingMessage;
        }

        const pending = pendingMessagesRef.current.get(clientMessageId);
        if (!pending) {
          return incomingMessage;
        }

        clearPendingMessageTimeout(clientMessageId);
        pendingMessagesRef.current.delete(clientMessageId);

        return {
          ...incomingMessage,
          sendStatus: 'sent',
        };
      },
      [clearPendingMessageTimeout]
    );

    useEffect(() => {
      return () => {
        clearReconnectNoticeTimer();
        Array.from(pendingMessageTimeoutsRef.current.values()).forEach((timeoutId) => {
          window.clearTimeout(timeoutId);
        });
        pendingMessageTimeoutsRef.current.clear();
        pendingMessagesRef.current.clear();
        chatService.disconnectWebSocket();
      };
    }, [chatService, clearReconnectNoticeTimer]);

    useEffect(() => {
      currentChatRef.current = state.currentChat;
    }, [state.currentChat]);

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
    }, [chatService]);

    const loadMessages = useCallback(
      async (chatId: string, options?: { appendOlder?: boolean }) => {
        try {
          const appendOlder = Boolean(options?.appendOlder);
          const skip = appendOlder ? loadedMessageCountRef.current : 0;
          const take = appendOlder ? OLDER_MESSAGES_TAKE : INITIAL_MESSAGES_TAKE;

          const messages = await chatService.getMessages(chatId, skip, take);
          const nextMessages = messages || [];

          setState((prev) => {
            if (!appendOlder) {
              return {
                ...prev,
                loadingOlderMessages: false,
                hasMoreMessages: nextMessages.length === INITIAL_MESSAGES_TAKE,
                messages: sortMessagesByCreatedAt(nextMessages),
              };
            }

            if (nextMessages.length === 0) {
              return {
                ...prev,
                loadingOlderMessages: false,
                hasMoreMessages: false,
              };
            }

            const seen = new Set(prev.messages.map((message) => message.id));
            const dedupedOlder = sortMessagesByCreatedAt(nextMessages).filter(
              (message) => !seen.has(message.id)
            );

            return {
              ...prev,
              loadingOlderMessages: false,
              hasMoreMessages: nextMessages.length === OLDER_MESSAGES_TAKE,
              messages: [...dedupedOlder, ...prev.messages],
            };
          });

          loadedMessageCountRef.current = appendOlder
            ? loadedMessageCountRef.current + nextMessages.length
            : nextMessages.length;

          if (!appendOlder) {
            await chatService.markAsRead(chatId);
            setState((prev) => ({
              ...prev,
              chats: prev.chats.map((chat) =>
                chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
              ),
            }));
          }
        } catch (err) {
          console.error('Failed to load messages:', err);
          setState((prev) => ({
            ...prev,
            loadingOlderMessages: false,
            error: (err as Error).message || 'Failed to load messages',
          }));
        }
      },
      [chatService]
    );

    const setComposerDraft = useCallback((draft: string) => {
      draftRef.current = draft;

      setState((prev) => ({
        ...prev,
        ...resolveComposerState(
          draft,
          prev.currentChat?.id || null,
          blockedReasonRef.current,
          false
        ),
      }));
    }, []);

    const clearSendFailure = useCallback(() => {
      setState((prev) => ({ ...prev, sendFailure: null }));
    }, []);

    const loadOlderMessages = useCallback(
      async (chatId?: string) => {
        const activeChatId = chatId || currentChatRef.current?.id;

        if (!activeChatId || state.loadingOlderMessages || !state.hasMoreMessages) {
          return;
        }

        setState((prev) => ({ ...prev, loadingOlderMessages: true }));
        await loadMessages(activeChatId, { appendOlder: true });
      },
      [loadMessages, state.hasMoreMessages, state.loadingOlderMessages]
    );

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

          loadedMessageCountRef.current = 0;

          setState((prev) => ({
            ...prev,
            currentChat: chat,
            messages: [],
            loadingOlderMessages: false,
            hasMoreMessages: false,
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
            onMessageReceived: (incomingMessage) => {
              const activeChatId = currentChatRef.current?.id;
              if (incomingMessage.chatId !== activeChatId) {
                return;
              }

              const message = acknowledgePendingMessage(incomingMessage);

              setState((prev) => {
                const withoutMatchedOptimistic = message.clientMessageId
                  ? prev.messages.filter(
                      (msg) =>
                        !(
                          msg.clientMessageId &&
                          msg.clientMessageId === message.clientMessageId &&
                          msg.id.startsWith('temp-')
                        )
                    )
                  : prev.messages;

                const messageExists = withoutMatchedOptimistic.some((msg) => msg.id === message.id);
                if (messageExists) {
                  return prev;
                }

                loadedMessageCountRef.current += 1;

                return {
                  ...prev,
                  messages: sortMessagesByCreatedAt([...withoutMatchedOptimistic, message]),
                  error: null,
                  sendFailure: null,
                };
              });
            },
            onConnectionChange: (connected) => {
              setState((prev) => ({ ...prev, isConnected: connected }));
            },
            onError: () => {
              markMostRecentPendingMessageFailed();
            },
            onConnectionStatusChange: (status) => {
              if (status === 'recovered') {
                setState((prev) => ({
                  ...prev,
                  isConnected: true,
                  connectionStatus: 'recovered',
                  reconnectNotice: RECONNECT_SUCCESS_COPY,
                }));

                const refreshAfterRecover = async () => {
                  await loadChats();
                  const activeChatId = currentChatRef.current?.id;
                  if (activeChatId) {
                    loadedMessageCountRef.current = 0;
                    setState((prev) => ({
                      ...prev,
                      loadingOlderMessages: false,
                      hasMoreMessages: false,
                    }));
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
                };

                refreshAfterRecover().catch((refreshError) => {
                  console.error('Failed to refresh chat data after reconnect:', refreshError);
                });

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
      [
        acknowledgePendingMessage,
        chatService,
        clearReconnectNoticeTimer,
        loadChats,
        loadMessages,
        markMostRecentPendingMessageFailed,
      ]
    );

    const sendMessage = useCallback(
      async (text: string, chatId?: string) => {
        const targetChatId = chatId || currentChatRef.current?.id;

        draftRef.current = text;

        const currentComposer = resolveComposerState(
          text,
          targetChatId || null,
          blockedReasonRef.current,
          false
        );

        if (currentComposer.sendDisabledReason || !targetChatId) {
          setState((prev) => ({
            ...prev,
            ...currentComposer,
          }));
          return false;
        }

        const content = text.trim();
        const clientMessageId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const optimisticMessageId = `temp-${clientMessageId}`;
        const optimisticCreatedAt = new Date().toISOString();
        const optimisticMessage: Message = {
          id: optimisticMessageId,
          chatId: targetChatId,
          senderId: useAuthStore.getState().user?.id,
          senderType: 'CUSTOMER',
          content,
          createdAt: optimisticCreatedAt,
          updatedAt: optimisticCreatedAt,
          isRead: true,
          clientMessageId,
          sendStatus: 'sending',
        };

        setState((prev) => ({
          ...prev,
          ...resolveComposerState(text, targetChatId, blockedReasonRef.current, true),
          messages: mergeMessages(prev.messages, [optimisticMessage]),
          sendFailure: null,
          error: null,
        }));

        const didEmit = chatService.sendWebSocketMessage(targetChatId, content, clientMessageId);

        if (!didEmit) {
          const sentMessage = await chatService.sendMessage(targetChatId, content);

          if (!sentMessage) {
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((message) =>
                message.id === optimisticMessageId ? { ...message, sendStatus: 'failed' } : message
              ),
              ...resolveComposerState(text, targetChatId, blockedReasonRef.current, false),
              sendFailure: SEND_FAILURE_COPY,
            }));
            return false;
          }

          blockedReasonRef.current = null;
          draftRef.current = '';

          setState((prev) => ({
            ...prev,
            ...resolveComposerState('', targetChatId, blockedReasonRef.current, false),
            messages: mergeMessages(
              prev.messages.filter((message) => message.id !== optimisticMessageId),
              [
                {
                  ...sentMessage,
                  chatId: sentMessage.chatId || targetChatId,
                  sendStatus: 'sent',
                },
              ]
            ),
            sendFailure: null,
            error: null,
          }));

          return true;
        }

        pendingMessagesRef.current.set(clientMessageId, {
          optimisticMessageId,
          chatId: targetChatId,
        });

        const timeoutId = window.setTimeout(() => {
          markPendingMessageFailed(clientMessageId);
        }, 12000);
        pendingMessageTimeoutsRef.current.set(clientMessageId, timeoutId);

        blockedReasonRef.current = null;
        draftRef.current = '';

        setState((prev) => ({
          ...prev,
          ...resolveComposerState('', targetChatId, blockedReasonRef.current, false),
          sendFailure: null,
          error: null,
        }));

        return true;
      },
      [chatService, markPendingMessageFailed]
    );

    const markAsRead = useCallback(
      async (chatId: string) => {
        try {
          await chatService.markAsRead(chatId);
          setState((prev) => ({
            ...prev,
            chats: prev.chats.map((chat) =>
              chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
            ),
          }));
        } catch (err) {
          console.error('Failed to mark as read:', err);
        }
      },
      [chatService]
    );

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
      [chatService, loadChats]
    );

    const disconnect = useCallback(() => {
      clearReconnectNoticeTimer();
      blockedReasonRef.current = null;
      draftRef.current = '';
      chatService.disconnectWebSocket();

      loadedMessageCountRef.current = 0;

      setState((prev) => ({
        ...prev,
        currentChat: null,
        messages: [],
        loadingOlderMessages: false,
        hasMoreMessages: false,
        isConnected: false,
        connectionStatus: 'disconnected',
        reconnectNotice: null,
        ...resolveComposerState('', null, blockedReasonRef.current, false),
        sendFailure: null,
      }));
    }, [chatService, clearReconnectNoticeTimer]);

    return {
      ...state,
      loadChats,
      selectChat,
      loadMessages,
      loadOlderMessages,
      sendMessage,
      markAsRead,
      createChat,
      disconnect,
      setComposerDraft,
      clearSendFailure,
    };
  };
};
