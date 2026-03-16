import { useState } from 'react';
import { Send, Paperclip, Image as ImageIcon, Smile } from 'lucide-react';
import { motion } from 'motion/react';

export function MessagesPage() {
  const [message, setMessage] = useState('');

  const messages = [
    {
      id: 1,
      from: 'studio',
      sender: 'Studio Team',
      text: "Thank you for booking with Studio HaMy! We're excited to be part of your special day.",
      time: '10:30 AM',
      date: 'Feb 1, 2026'
    },
    {
      id: 2,
      from: 'user',
      sender: 'You',
      text: "Thank you! We're really looking forward to working with you.",
      time: '11:15 AM',
      date: 'Feb 1, 2026'
    },
    {
      id: 3,
      from: 'studio',
      sender: 'Michael Chen',
      text: 'I wanted to reach out about your engagement session. I have some great location ideas that would be perfect for your style.',
      time: '2:45 PM',
      date: 'Feb 1, 2026'
    },
    {
      id: 4,
      from: 'user',
      sender: 'You',
      text: 'That sounds wonderful! What locations did you have in mind?',
      time: '3:20 PM',
      date: 'Feb 1, 2026'
    },
    {
      id: 5,
      from: 'studio',
      sender: 'Michael Chen',
      text: 'I was thinking we could do a beach sunset shoot or perhaps a garden with lots of natural light. Both would be stunning for your photos!',
      time: '3:35 PM',
      date: 'Feb 1, 2026'
    },
    {
      id: 6,
      from: 'studio',
      sender: 'Studio Team',
      text: "Looking forward to your engagement session next month! Please let us know if you need any help with outfit coordination or location questions.",
      time: '9:00 AM',
      date: 'Feb 3, 2026'
    }
  ];

  const handleSend = () => {
    if (message.trim()) {
      // In a real app, this would send the message
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-6">
            <h1 className="text-2xl font-serif text-white mb-1">Messages</h1>
            <p className="text-rose-100 text-sm">Chat with the Studio HaMy team</p>
          </div>

          {/* Messages Container */}
          <div className="flex flex-col h-[calc(100%-140px)]">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${msg.from === 'user' ? 'order-2' : 'order-1'}`}>
                    {/* Sender Name & Time */}
                    <div className={`flex items-center gap-2 mb-1 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-gray-500">{msg.sender}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        msg.from === 'user'
                          ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-3 pr-24 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Paperclip className="size-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <ImageIcon className="size-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Smile className="size-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
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