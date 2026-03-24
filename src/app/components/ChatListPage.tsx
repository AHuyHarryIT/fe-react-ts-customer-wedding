import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar } from './ui/avatar';
import { chatService, type Chat } from '../../services/chatService';

export function ChatListPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        const data = await chatService.getChats();
        setChats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="p-4">Loading chats...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      {chats.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No chats yet. Contact support to start a conversation!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <Card key={chat.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">S</Avatar>
                  <div>
                    <h3 className="font-semibold">Staff Member</h3>
                    <p className="text-sm text-gray-500">
                      {chat.lastMessageAt
                        ? formatDate(new Date(chat.lastMessageAt))
                        : 'No messages yet'}
                    </p>
                  </div>
                </div>
                <Button variant="outline">Open Chat</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
