import { useEffect, useRef, useState } from 'react';
import { Send, Paperclip, Image as ImageIcon, Smile } from 'lucide-react';
import { motion } from 'motion/react';
import { CustomerStatePanel } from '@/components/pages/CustomerStatePanel';
import { useChat } from '@/hooks/useChat';
import type { ChatConnectionStatus, Chat } from '@/types';
import { useAuthStore } from '@/stores/authStore';

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

export function MessagesPage() {
  const {
    chats,
    currentChat,
    messages,
    loading,
    error,
    loadChats,
    selectChat,
    sendMessage,
    createChat,
    connectionStatus,
    sendDisabledReason,
    sendFailure,
    reconnectNotice,
    setComposerDraft,
    clearSendFailure,
  } = useChat();
  const { user: currentUser } = useAuthStore();
  const [inputMessage, setInputMessage] = useState('');
  const [initialInputMessage, setInitialInputMessage] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [initialSendFailure, setInitialSendFailure] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (
      chats &&
      chats.length > 0 &&
      (!currentChat || !chats.some((chat) => chat.id === currentChat.id))
    ) {
      void selectChat(chats[0].id);
    }
  }, [chats, currentChat, selectChat]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectChat = async (chatId: string) => {
    await selectChat(chatId);
    setInputMessage('');
    setComposerDraft('');
    setInitialSendFailure(null);
    clearSendFailure();
  };

  const handleSendMessage = async () => {
    if (!currentChat) return;

    const draft = inputMessage;
    const success = await sendMessage(draft);

    if (success) {
      setInputMessage('');
      setComposerDraft('');
      clearSendFailure();
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
              <h1 className="text-2xl font-serif text-white mb-1">Messages</h1>
              <p className="text-rose-100 text-sm">Chat with the Studio HaMy team</p>
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
                      onClick={() => void handleSelectChat(chat.id)}
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
                    description="Send a message to start chatting with the Studio HaMy team."
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
                                    void handleSendInitialMessage();
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
                              onClick={() => void handleSendInitialMessage()}
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
                {currentChat.staffName || 'Studio Team'}
              </h1>
              <p className="text-rose-100 text-sm">{connectionCopy}</p>
            </div>
          </div>

          <div className="flex flex-col h-[calc(100%-140px)]">
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, index) => {
                const currentCustomerId = currentChat.customerId || currentUser?.id;
                const isUserMessage =
                  Boolean(currentCustomerId) && msg.senderId === currentCustomerId;

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
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            isUserMessage
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {isUserMessage ? 'You' : 'Studio Team'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isUserMessage
                            ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
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
                        void handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-3 pr-24 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
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

                <button
                  type="button"
                  aria-label="Send message"
                  onClick={() => void handleSendMessage()}
                  disabled={Boolean(sendDisabledReason)}
                  className="size-12 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="size-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 px-2">
                Press Enter to send, Shift + Enter for new line
              </p>
              {sendDisabledReason && (
                <p className="text-xs text-gray-500 mt-2 px-2">{sendDisabledReason}</p>
              )}
              <p className="text-xs text-gray-500 mt-1 px-2">{ATTACHMENTS_UNAVAILABLE_REASON}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
