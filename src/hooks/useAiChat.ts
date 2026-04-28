import { createUseChat } from './createUseChat';
import { aiChatService } from '@/services/aiChatService';

export const useAiChat = createUseChat(aiChatService);
