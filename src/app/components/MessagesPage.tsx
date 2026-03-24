import { useEffect, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Check,
} from "lucide-react";
import { motion } from "motion/react";
import { useChat } from "../../hooks/useChat";
import type { Chat } from "../../services/chatService";
import { useAuthStore } from "../../stores/authStore";

interface MessagesPageProps {
  onNavigate?: (page: string) => void;
}

export function MessagesPage({ onNavigate }: MessagesPageProps) {
  void onNavigate;
  const {
    chats,
    currentChat,
    messages,
    loading,
    error,
    loadChats,
    selectChat,
    sendMessage,
    isConnected,
    createChat,
  } = useChat();
  const { user: currentUser } = useAuthStore();
  const [inputMessage, setInputMessage] = useState("");
  const [initialInputMessage, setInitialInputMessage] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Auto-select first chat when chats are loaded
  useEffect(() => {
    if (
      chats &&
      chats.length > 0 &&
      (!currentChat || !chats.some((chat) => chat.id === currentChat.id))
    ) {
      handleSelectChat(chats[0].id);
    }
  }, [chats, currentChat]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectChat = async (chatId: string) => {
    await selectChat(chatId);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentChat) return;

    const messageText = inputMessage;
    setInputMessage("");

    await sendMessage(messageText);
  };

  const handleSendInitialMessage = async () => {
    if (!initialInputMessage.trim()) return;

    const messageContent = initialInputMessage;
    setInitialInputMessage("");
    setIsCreatingChat(true);

    try {
      const newChat = await createChat();

      if (newChat) {
        await selectChat(newChat.id);
        await sendMessage(messageContent, newChat.id);
      }
    } finally {
      setIsCreatingChat(false);
    }
  };

  const getCustomerName = (chat: Chat) => {
    if (chat.customer?.firstName || chat.customer?.lastName) {
      return `${chat.customer.firstName || ""} ${chat.customer.lastName || ""}`.trim();
    }
    return currentUser?.firstName || "You";
  };

  // Show chat list if no chat selected
  if (!currentChat) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-6">
              <h1 className="text-2xl font-serif text-white mb-1">Messages</h1>
              <p className="text-rose-100 text-sm">
                Chat with the Studio HaMy team
              </p>
            </div>

            {/* Chat List */}
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-6 text-center text-gray-500">
                  <p>Loading chats...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">
                  <p>{error}</p>
                </div>
              ) : chats && chats.length > 0 ? (
                chats.map((chat, index) => (
                  <motion.button
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSelectChat(chat.id)}
                    className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {getCustomerName(chat)}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage || "No messages yet"}
                        </p>
                      </div>
                      {chat.unreadCount && chat.unreadCount > 0 && (
                        <div className="ml-2 px-2 py-1 bg-rose-400 text-white text-xs rounded-full">
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-500 mb-4">No chats yet</p>
                  <p className="text-sm text-gray-400 mb-6">
                    Send a message to start chatting with the Studio HaMy team
                  </p>

                  {/* Message Input Area */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-end gap-3">
                      <div className="flex-1 relative">
                        <textarea
                          value={initialInputMessage}
                          onChange={(e) =>
                            setInitialInputMessage(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendInitialMessage();
                            }
                          }}
                          placeholder="Type your first message..."
                          rows={1}
                          disabled={isCreatingChat || loading}
                          className="w-full px-4 py-3 pr-24 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                      <button
                        onClick={handleSendInitialMessage}
                        disabled={
                          !initialInputMessage.trim() ||
                          isCreatingChat ||
                          loading
                        }
                        className="size-12 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="size-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 px-2">
                      Press Enter to send, Shift + Enter for new line
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show individual chat
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif text-white mb-1">
                {currentChat.staffName || "Studio Team"}
              </h1>
              <div className="flex items-center gap-2">
                <div
                  className={`size-2 rounded-full ${isConnected ? "bg-green-300" : "bg-gray-300"}`}
                />
                <p className="text-rose-100 text-sm">
                  {isConnected ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex flex-col h-[calc(100%-140px)]">
            {/* Messages List */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages &&
                messages.map((msg, index) => {
                  // Prefer chat.customerId for ownership to avoid stale auth-store mismatches.
                  const currentCustomerId = currentChat?.customerId || currentUser?.id;
                  const isUserMessage =
                    Boolean(currentCustomerId) &&
                    msg.senderId === currentCustomerId;
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%]`}>
                        {/* Sender Name & Time */}
                        <div
                          className={`flex items-center gap-2 mb-2 ${isUserMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
                              isUserMessage
                                ? "bg-rose-100 text-rose-700"
                                : "bg-blue-100 text-blue-700"
                            }`}>
                              {isUserMessage ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  You (Customer) - Sent
                                </>
                              ) : (
                                <>
                                  Studio Team (Staff) - Received
                                </>
                              )}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            isUserMessage
                              ? "bg-gradient-to-r from-rose-400 to-pink-500 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              {error && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  {error}
                </div>
              )}
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    disabled={!isConnected}
                    className="w-full px-4 py-3 pr-24 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
                      <Paperclip className="size-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
                      <ImageIcon className="size-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
                      <Smile className="size-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || !isConnected}
                  className="size-12 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="size-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 px-2">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
