import { Link } from '@tanstack/react-router';
import { Bot, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export function MessagesModePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600 mb-8">Choose who you want to chat with right now.</p>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              to="/messages/staff"
              className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-full bg-white p-3 shadow-sm">
                <MessageSquare className="size-6 text-rose-500" />
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">Staff Chat</h2>
              <p className="text-sm text-gray-600">
                Talk with the Studio HaMy team about bookings and logistics.
              </p>
            </Link>

            <Link
              to="/messages/ai"
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-full bg-white p-3 shadow-sm">
                <Bot className="size-6 text-slate-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">AI Chat</h2>
              <p className="text-sm text-gray-600">Get instant answers from the AI assistant.</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
