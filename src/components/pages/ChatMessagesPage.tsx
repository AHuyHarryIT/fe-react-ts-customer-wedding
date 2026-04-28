import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Paperclip, Image as ImageIcon, Smile, Square } from 'lucide-react';
import { motion } from 'motion/react';
import { CustomerStatePanel } from '@/components/pages/CustomerStatePanel';
import { useAuthStore } from '@/stores/authStore';
import type { Chat, ChatConnectionStatus, UseChatActions, UseChatState } from '@/types';

type ChatMode = 'staff' | 'ai';

type ChatHookResult = UseChatState & UseChatActions;

interface ChatMessagesPageProps {
  mode: ChatMode;
  useChatHook: () => ChatHookResult;
}

const ATTACHMENTS_UNAVAILABLE_REASON = 'Attachments are not available in this release.';
const FIRST_MESSAGE_SEND_FAILURE_COPY = 'Message not sent. Check your connection and try again.';

const getConnectionCopy = (status: ChatConnectionStatus, reconnectNotice: string | null) => {
  if (reconnectNotice) return reconnectNotice;
  if (status === 'reconnecting') return 'Reconnecting… syncing latest messages';
  if (status === 'disconnected') return 'Connection lost. Trying to reconnect…';
  return 'Live updates on';
};

const formatUnreadCount = (count?: number) => {
  if (!count || count <= 0) return null;
  return count > 99 ? '99+' : String(count);
};

const getSendStatusCopy = (status?: 'sending' | 'sent' | 'failed') => {
  if (status === 'sending') return 'Sending…';
  if (status === 'failed') return 'Failed to send';
  if (status === 'sent') return 'Sent';
  return null;
};

const getModeConfig = (mode: ChatMode) => {
  if (mode === 'ai') {
    return {
      pageTitle: 'AI Messages',
      pageSubtitle: 'Chat with the AI assistant',
      incomingLabel: 'AI Assistant',
      emptyDescription: 'Send a message to start chatting with the AI assistant.',
      activeThreadTitle: 'AI Assistant',
      incomingChipClassName: 'bg-slate-200 text-slate-700',
      incomingBubbleClassName: 'bg-slate-100 text-slate-800 border border-slate-200',
    };
  }

  return {
    pageTitle: 'Staff Messages',
    pageSubtitle: 'Chat with the Studio HaMy team',
    incomingLabel: 'Studio Team',
    emptyDescription: 'Send a message to start chatting with the Studio HaMy team.',
    activeThreadTitle: 'Studio Team',
    incomingChipClassName: 'bg-blue-100 text-blue-700',
    incomingBubbleClassName: 'bg-gray-100 text-gray-800',
  };
};

export function ChatMessagesPage({ mode, useChatHook }: ChatMessagesPageProps) {
  const {
    chats,
    currentChat,
    messages,
    loading,
    loadingOlderMessages,
    hasMoreMessages,
    error,
    loadChats,
    selectChat,
    loadOlderMessages,
    sendMessage,
    createChat,
    connectionStatus,
    sendDisabledReason,
    sendFailure,
    reconnectNotice,
    setComposerDraft,
    clearSendFailure,
  } = useChatHook();
  const { user: currentUser } = useAuthStore();
  const [inputMessage, setInputMessage] = useState('');
  const [initialInputMessage, setInitialInputMessage] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [initialSendFailure, setInitialSendFailure] = useState<string | null>(null);
  const [aiWaitingStopped, setAiWaitingStopped] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousChatIdRef = useRef<string | null>(null);
  const previousFirstMessageIdRef = useRef<string | null>(null);
  const previousMessageCountRef = useRef(0);
  const loadingOlderRef = useRef(false);
  const modeConfig = getModeConfig(mode);

  const waitingForAiRaw = useMemo(() => {
    if (mode !== 'ai') {
      return false;
    }

    const customerMessages = messages.filter((msg) => msg.senderType === 'CUSTOMER');
    if (customerMessages.length === 0) {
      return false;
    }

    const latestCustomerMessage = customerMessages[customerMessages.length - 1];
    const latestCustomerEpoch = new Date(latestCustomerMessage.createdAt).getTime();

    if (!Number.isFinite(latestCustomerEpoch)) {
      return false;
    }

    const aiMessages = messages.filter((msg) => msg.senderType === 'AI');
    if (aiMessages.length === 0) {
      return true;
    }

    const latestAiMessage = aiMessages[aiMessages.length - 1];
    const latestAiEpoch = new Date(latestAiMessage.createdAt).getTime();

    if (!Number.isFinite(latestAiEpoch)) {
      return true;
    }

    return latestAiEpoch < latestCustomerEpoch;
  }, [messages, mode]);

  const isWaitingForAi = mode === 'ai' && waitingForAiRaw && !aiWaitingStopped;
  const isComposerLocked = isWaitingForAi;

  useEffect(() => {
    loadChats().catch((loadError) => {
      console.error('Failed to load chats on mount:', loadError);
    });
  }, [loadChats]);

  useEffect(() => {
    if (
      chats &&
      chats.length > 0 &&
      (!currentChat || !chats.some((chat) => chat.id === currentChat.id))
    ) {
      selectChat(chats[0].id).catch((selectError) => {
        console.error('Failed to auto-select latest chat:', selectError);
      });
    }
  }, [chats, currentChat, selectChat]);

  useEffect(() => {
    if (!currentChat) {
      return;
    }

    const nextChatId = currentChat.id;
    const chatChanged = previousChatIdRef.current !== nextChatId;

    if (chatChanged && messagesContainerRef.current) {
      const frameOne = requestAnimationFrame(() => {
        if (!messagesContainerRef.current) {
          return;
        }

        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;

        const frameTwo = requestAnimationFrame(() => {
          if (!messagesContainerRef.current) {
            return;
          }

          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        });

        return () => cancelAnimationFrame(frameTwo);
      });

      previousChatIdRef.current = nextChatId;
      previousFirstMessageIdRef.current = messages[0]?.id || null;
      previousMessageCountRef.current = messages.length;

      return () => cancelAnimationFrame(frameOne);
    }

    const nextFirstMessageId = messages[0]?.id || null;
    const prependedOlderMessages =
      previousMessageCountRef.current > 0 &&
      messages.length > previousMessageCountRef.current &&
      previousFirstMessageIdRef.current !== null &&
      nextFirstMessageId !== null &&
      previousFirstMessageIdRef.current !== nextFirstMessageId;

    if (!prependedOlderMessages && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }

    previousFirstMessageIdRef.current = nextFirstMessageId;
    previousMessageCountRef.current = messages.length;
  }, [currentChat, messages]);

  const handleThreadScroll = async () => {
    const container = messagesContainerRef.current;

    if (!container || !currentChat || loadingOlderRef.current) {
      return;
    }

    if (!hasMoreMessages || loadingOlderMessages) {
      return;
    }

    if (container.scrollTop > 40) {
      return;
    }

    const previousScrollHeight = container.scrollHeight;
    const previousScrollTop = container.scrollTop;

    loadingOlderRef.current = true;

    try {
      await loadOlderMessages(currentChat.id);

      requestAnimationFrame(() => {
        if (!messagesContainerRef.current) {
          return;
        }

        const newScrollHeight = messagesContainerRef.current.scrollHeight;
        messagesContainerRef.current.scrollTop =
          newScrollHeight - previousScrollHeight + previousScrollTop;
      });
    } finally {
      loadingOlderRef.current = false;
    }
  };

  useEffect(() => {
    if (!waitingForAiRaw && aiWaitingStopped) {
      setAiWaitingStopped(false);
    }
  }, [aiWaitingStopped, waitingForAiRaw]);

  useEffect(() => {
    if (mode !== 'ai' && aiWaitingStopped) {
      setAiWaitingStopped(false);
    }
  }, [aiWaitingStopped, mode]);

  useEffect(() => {
    if (mode !== 'ai') {
      return;
    }

    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.senderType === 'CUSTOMER') {
      setAiWaitingStopped(false);
    }
  }, [messages, mode]);

  const handleSelectChat = async (chatId: string) => {
    await selectChat(chatId);
    setInputMessage('');
    setComposerDraft('');
    setInitialSendFailure(null);
    setAiWaitingStopped(false);
    clearSendFailure();
  };

  const handleSendMessage = async () => {
    if (!currentChat || isComposerLocked) return;

    const draft = inputMessage;
    const outgoingMessage = draft.trim();
    if (!outgoingMessage) return;

    if (mode === 'ai') {
      setAiWaitingStopped(false);
    }

    setInputMessage('');
    setComposerDraft('');
    clearSendFailure();

    const success = await sendMessage(outgoingMessage);

    if (success) {
      return;
    }

    setInputMessage(draft);
    setComposerDraft(draft);
  };

  const handleSendInitialMessage = async () => {
    if (!initialInputMessage.trim()) return;

    const messageContent = initialInputMessage;
    setIsCreatingChat(true);
    setInitialSendFailure(null);

    try {
      const newChat = await createChat();

      if (newChat) {
        await selectChat(newChat.id);
        const success = await sendMessage(messageContent, newChat.id);
        if (success) {
          setInitialInputMessage('');
          setInitialSendFailure(null);
        } else {
          setInitialSendFailure(FIRST_MESSAGE_SEND_FAILURE_COPY);
        }
        return;
      }

      setComposerDraft(messageContent);
      setInitialSendFailure(FIRST_MESSAGE_SEND_FAILURE_COPY);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const getCustomerName = (chat: Chat) => {
    if (chat.customer?.firstName || chat.customer?.lastName) {
      return `${chat.customer.firstName || ''} ${chat.customer.lastName || ''}`.trim();
    }
    return currentUser?.firstName || 'You';
  };

  const connectionCopy = getConnectionCopy(connectionStatus, reconnectNotice);

  const sendInitialMessageFromButton = () => {
    handleSendInitialMessage().catch((sendError) => {
      console.error('Failed to send initial message:', sendError);
    });
  };

  const sendMessageFromButton = () => {
    handleSendMessage().catch((sendError) => {
      console.error('Failed to send message:', sendError);
    });
  };

  const stopAiWaiting = () => {
    if (mode !== 'ai') {
      return;
    }

    setAiWaitingStopped(true);
  };

  const composerDisabledReason = isComposerLocked ? 'AI is thinking…' : sendDisabledReason;
  const composerHelperCopy = isComposerLocked
    ? 'Please wait for AI response or press Stop.'
    : 'Press Enter to send, Shift + Enter for new line';
  const composerPlaceholder = isComposerLocked ? 'AI is thinking…' : 'Type your message...';
  const canShowThinkingRow = mode === 'ai' && isWaitingForAi;
  const isSendDisabled = Boolean(composerDisabledReason);

  if (!currentChat) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-6">
              <h1 className="text-2xl font-serif text-white mb-1">{modeConfig.pageTitle}</h1>
              <p className="text-rose-100 text-sm">{modeConfig.pageSubtitle}</p>
            </div>

            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-6">
                  <CustomerStatePanel
                    tone="loading"
                    title="Loading chats"
                    description="We are pulling your latest conversations and unread updates."
                  />
                </div>
              ) : error ? (
                <div className="p-6">
                  <CustomerStatePanel
                    tone="error"
                    title="Could not load chats"
                    description={error}
                  />
                </div>
              ) : chats && chats.length > 0 ? (
                chats.map((chat, index) => {
                  const unreadLabel = formatUnreadCount(chat.unreadCount);

                  return (
                    <motion.button
                      key={chat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        handleSelectChat(chat.id).catch((selectError) => {
                          console.error('Failed to select chat from list:', selectError);
                        });
                      }}
                      className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{getCustomerName(chat)}</h3>
                          <p className="text-sm text-gray-600 truncate">
                            {chat.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                        {unreadLabel && (
                          <div className="ml-2 px-2 py-1 bg-rose-400 text-white text-xs rounded-full">
                            {unreadLabel}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })
              ) : (
                <div className="p-12 text-center">
                  <CustomerStatePanel
                    tone="empty"
                    title="No chats yet"
                    description={modeConfig.emptyDescription}
                    actions={
                      <div className="w-full">
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                          <div className="flex items-end gap-3">
                            <div className="flex-1 relative">
                              <label htmlFor="initial-message-composer" className="sr-only">
                                Type your first message
                              </label>
                              <textarea
                                id="initial-message-composer"
                                name="initialMessage"
                                value={initialInputMessage}
                                onChange={(e) => setInitialInputMessage(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendInitialMessage().catch((sendError) => {
                                      console.error(
                                        'Failed to send first message from keyboard:',
                                        sendError
                                      );
                                    });
                                  }
                                }}
                                placeholder="Type your first message..."
                                rows={1}
                                disabled={isCreatingChat || loading}
                                className="w-full px-4 py-3 pr-24 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                              />
                            </div>
                            <button
                              type="button"
                              aria-label="Send first message"
                              onClick={sendInitialMessageFromButton}
                              disabled={!initialInputMessage.trim() || isCreatingChat || loading}
                              className="size-12 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="size-5" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 px-2">
                            Press Enter to send, Shift + Enter for new line
                          </p>
                          {initialSendFailure && (
                            <p className="text-xs text-red-600 mt-2 px-2">{initialSendFailure}</p>
                          )}
                        </div>
                      </div>
                    }
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
        >
          <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif text-white mb-1">
                {mode === 'staff'
                  ? currentChat.staffName || modeConfig.activeThreadTitle
                  : modeConfig.activeThreadTitle}
              </h1>
              <p className="text-rose-100 text-sm">{connectionCopy}</p>
            </div>
          </div>

          <div className="flex flex-col h-[calc(100%-140px)]">
            <div
              ref={messagesContainerRef}
              onScroll={() => {
                handleThreadScroll().catch((scrollError) => {
                  console.error('Failed to load older messages on scroll:', scrollError);
                });
              }}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {loadingOlderMessages && (
                <div className="flex justify-center">
                  <div className="text-xs text-gray-500">Loading older messages…</div>
                </div>
              )}

              {!loadingOlderMessages && !hasMoreMessages && messages.length > 0 && (
                <div className="text-center">
                  <div className="text-xs text-gray-400">Beginning of conversation</div>
                </div>
              )}

              {messages.map((msg, index) => {
                const currentCustomerId = currentChat.customerId || currentUser?.id;
                const isUserMessage = msg.senderType
                  ? msg.senderType === 'CUSTOMER'
                  : Boolean(currentCustomerId) && msg.senderId === currentCustomerId;

                const senderLabel = isUserMessage ? 'You' : modeConfig.incomingLabel;

                const senderChipClassName = isUserMessage
                  ? 'bg-rose-100 text-rose-700'
                  : modeConfig.incomingChipClassName;

                const messageBubbleClassName = isUserMessage
                  ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white'
                  : modeConfig.incomingBubbleClassName;

                const sendStatusCopy = isUserMessage ? getSendStatusCopy(msg.sendStatus) : null;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[70%]">
                      <div
                        className={`flex items-center gap-2 mb-2 ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${senderChipClassName}`}
                        >
                          {senderLabel}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className={`rounded-2xl px-4 py-3 ${messageBubbleClassName}`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>

                      {sendStatusCopy && (
                        <p className="mt-1 text-xs text-gray-400 text-right">{sendStatusCopy}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {canShowThinkingRow && (
                <div className="flex justify-start">
                  <div className="max-w-[70%]">
                    <div className="flex items-center gap-2 mb-2 justify-start">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                        AI Assistant
                      </span>
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-slate-100 text-slate-800 border border-slate-200">
                      <p className="text-sm leading-relaxed">AI is thinking…</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4">
              {error && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  {error}
                </div>
              )}
              {sendFailure && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  {sendFailure}
                </div>
              )}

              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <label htmlFor="message-composer" className="sr-only">
                    Type your message
                  </label>
                  <textarea
                    id="message-composer"
                    name="message"
                    value={inputMessage}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setInputMessage(nextValue);
                      setComposerDraft(nextValue);
                      if (sendFailure) clearSendFailure();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage().catch((sendError) => {
                          console.error('Failed to send message from keyboard:', sendError);
                        });
                      }
                    }}
                    placeholder={composerPlaceholder}
                    rows={1}
                    disabled={isComposerLocked}
                    className="w-full px-4 py-3 pr-24 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />

                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Attach a file"
                      disabled
                      title={ATTACHMENTS_UNAVAILABLE_REASON}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Paperclip className="size-4 text-gray-400" />
                    </button>
                    <button
                      type="button"
                      aria-label="Attach an image"
                      disabled
                      title={ATTACHMENTS_UNAVAILABLE_REASON}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ImageIcon className="size-4 text-gray-400" />
                    </button>
                    <button
                      type="button"
                      aria-label="Insert an emoji"
                      disabled
                      title={ATTACHMENTS_UNAVAILABLE_REASON}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Smile className="size-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {canShowThinkingRow ? (
                  <button
                    type="button"
                    aria-label="Stop waiting for AI"
                    onClick={stopAiWaiting}
                    className="h-12 px-4 bg-slate-700 text-white rounded-full flex items-center gap-2 justify-center hover:bg-slate-800 transition-all"
                  >
                    <Square className="size-4" />
                    <span className="text-sm font-medium">Stop</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Send message"
                    onClick={sendMessageFromButton}
                    disabled={isSendDisabled}
                    className="size-12 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="size-5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 px-2">{composerHelperCopy}</p>
              {composerDisabledReason && (
                <p className="text-xs text-gray-500 mt-2 px-2">{composerDisabledReason}</p>
              )}
              <p className="text-xs text-gray-500 mt-1 px-2">{ATTACHMENTS_UNAVAILABLE_REASON}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
