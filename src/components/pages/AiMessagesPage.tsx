import { ChatMessagesPage } from './ChatMessagesPage';
import { useAiChat } from '@/hooks/useAiChat';

export function AiMessagesPage() {
  return <ChatMessagesPage mode="ai" useChatHook={useAiChat} />;
}
