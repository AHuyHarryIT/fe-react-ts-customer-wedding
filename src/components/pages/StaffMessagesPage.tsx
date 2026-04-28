import { ChatMessagesPage } from './ChatMessagesPage';
import { useStaffChat } from '@/hooks/useStaffChat';

export function StaffMessagesPage() {
  return <ChatMessagesPage mode="staff" useChatHook={useStaffChat} />;
}
