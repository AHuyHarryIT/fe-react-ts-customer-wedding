import { Link } from '@tanstack/react-router';
import { Bot, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingChatButton() {
  return (
    <div className="fixed right-6 bottom-6 z-40 sm:right-8 sm:bottom-8">
      <div className="flex flex-col items-end gap-2">
        <Button
          asChild
          size="lg"
          className="h-11 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-4 text-white shadow-lg shadow-rose-200 hover:from-rose-500 hover:to-pink-600"
        >
          <Link to="/messages/staff" aria-label="Open staff chat" className="gap-2">
            <MessageSquare className="size-4" />
            <span className="hidden sm:inline">Staff Chat</span>
          </Link>
        </Button>

        <Button
          asChild
          size="lg"
          className="h-11 rounded-full bg-slate-900 px-4 text-white shadow-lg shadow-slate-200 hover:bg-slate-800"
        >
          <Link to="/messages/ai" aria-label="Open AI chat" className="gap-2">
            <Bot className="size-4" />
            <span className="hidden sm:inline">AI Chat</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
