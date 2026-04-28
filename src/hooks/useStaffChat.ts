import { createUseChat } from './createUseChat';
import { staffChatService } from '@/services/staffChatService';

export const useStaffChat = createUseChat(staffChatService);
