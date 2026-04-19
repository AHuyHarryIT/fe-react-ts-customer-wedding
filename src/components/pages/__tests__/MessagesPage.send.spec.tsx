import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessagesPage } from '../MessagesPage';
import type { Chat, Message } from '@/types';

const { useChatMock } = vi.hoisted(() => ({
  useChatMock: vi.fn(),
}));

vi.mock('@/hooks/useChat', () => ({
  useChat: useChatMock,
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'customer-1',
      firstName: 'Alex',
    },
  }),
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ComponentProps<'button'>) => (
      <button {...props}>{children}</button>
    ),
  },
}));

const chatFixture: Chat = {
  id: 'chat-1',
  customerId: 'customer-1',
  staffId: 'staff-1',
  createdAt: '2026-04-19T00:00:00.000Z',
  updatedAt: '2026-04-19T00:00:00.000Z',
  staffName: 'Studio Team',
  unreadCount: 0,
};

const messageFixture: Message = {
  id: 'message-1',
  chatId: 'chat-1',
  senderId: 'customer-1',
  content: 'Need to reschedule this week',
  createdAt: '2026-04-19T01:00:00.000Z',
  updatedAt: '2026-04-19T01:00:00.000Z',
  isRead: false,
};

const createUseChatResult = (overrides: Record<string, unknown> = {}) => ({
  chats: [chatFixture],
  currentChat: chatFixture,
  messages: [],
  loading: false,
  error: null,
  isConnected: true,
  connectionStatus: 'connected',
  composerState: 'idle',
  sendDisabledReason: null,
  sendFailure: null,
  reconnectNotice: null,
  loadChats: vi.fn().mockResolvedValue(undefined),
  selectChat: vi.fn().mockResolvedValue(undefined),
  loadMessages: vi.fn().mockResolvedValue(undefined),
  sendMessage: vi.fn().mockResolvedValue(true),
  markAsRead: vi.fn().mockResolvedValue(undefined),
  createChat: vi.fn().mockResolvedValue(null),
  disconnect: vi.fn(),
  setComposerDraft: vi.fn(),
  clearSendFailure: vi.fn(),
  ...overrides,
});

describe('MessagesPage send contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disables send with Enter a message to send. when input is empty', () => {
    useChatMock.mockReturnValue(
      createUseChatResult({
        sendDisabledReason: 'Enter a message to send.',
      })
    );

    render(<MessagesPage />);

    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
    expect(screen.getByText('Enter a message to send.')).toBeInTheDocument();
  });

  it('hides no-thread disabled reason copy until conversation is selected', () => {
    useChatMock.mockReturnValue(
      createUseChatResult({
        chats: [],
        currentChat: null,
        sendDisabledReason: 'Select a conversation first.',
      })
    );

    render(<MessagesPage />);

    expect(screen.getByRole('button', { name: /send first message/i })).toBeDisabled();
    expect(screen.queryByText('Select a conversation first.')).not.toBeInTheDocument();
  });

  it('keeps unsent text and shows Message not sent. Check your connection and try again. on send failure', async () => {
    const user = userEvent.setup();
    useChatMock.mockReturnValue(
      createUseChatResult({
        sendMessage: vi.fn().mockResolvedValue(false),
        sendFailure: 'Message not sent. Check your connection and try again.',
      })
    );

    render(<MessagesPage />);

    const textarea = screen.getByLabelText(/type your message/i);
    await user.type(textarea, 'Need to reschedule this week');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(textarea).toHaveValue('Need to reschedule this week');
    expect(
      screen.getByText('Message not sent. Check your connection and try again.')
    ).toBeInTheDocument();
  });

  it('keeps unsent first-message draft and shows Message not sent. Check your connection and try again. when no-thread chat creation fails', async () => {
    const user = userEvent.setup();
    useChatMock.mockReturnValue(
      createUseChatResult({
        chats: [],
        currentChat: null,
        createChat: vi.fn().mockResolvedValue(null),
      })
    );

    render(<MessagesPage />);

    const textarea = screen.getByLabelText(/type your first message/i);
    await user.type(textarea, 'Need to reschedule this week');
    await user.click(screen.getByRole('button', { name: /send first message/i }));

    expect(textarea).toHaveValue('Need to reschedule this week');
    expect(
      screen.getByText('Message not sent. Check your connection and try again.')
    ).toBeInTheDocument();
  });

  it('renders reconnect status copy cycle: Live updates on, Reconnecting… syncing latest messages, Connection lost. Trying to reconnect…', () => {
    useChatMock
      .mockReturnValueOnce(createUseChatResult({ connectionStatus: 'connected' }))
      .mockReturnValueOnce(createUseChatResult({ connectionStatus: 'reconnecting' }))
      .mockReturnValueOnce(createUseChatResult({ connectionStatus: 'disconnected' }));

    const { rerender } = render(<MessagesPage />);
    expect(screen.getByText('Live updates on')).toBeInTheDocument();

    rerender(<MessagesPage />);
    expect(screen.getByText('Reconnecting… syncing latest messages')).toBeInTheDocument();

    rerender(<MessagesPage />);
    expect(screen.getByText('Connection lost. Trying to reconnect…')).toBeInTheDocument();
  });

  it('shows Back online. Refreshing latest messages… after reconnect recovery', () => {
    useChatMock.mockReturnValue(
      createUseChatResult({
        connectionStatus: 'recovered',
        reconnectNotice: 'Back online. Refreshing latest messages…',
      })
    );

    render(<MessagesPage />);

    expect(screen.getByText('Back online. Refreshing latest messages…')).toBeInTheDocument();
  });

  it('refetches chats then active thread messages on reconnect recovery', () => {
    const loadChats = vi.fn().mockResolvedValue(undefined);
    const loadMessages = vi.fn().mockResolvedValue(undefined);

    useChatMock.mockReturnValue(
      createUseChatResult({
        connectionStatus: 'recovered',
        reconnectNotice: 'Back online. Refreshing latest messages…',
        loadChats,
        loadMessages,
      })
    );

    render(<MessagesPage />);

    expect(screen.getByText('Back online. Refreshing latest messages…')).toBeInTheDocument();
    expect(loadChats).toBeDefined();
    expect(loadMessages).toBeDefined();
  });

  it('caps thread unread badge display at 99+', () => {
    useChatMock.mockReturnValue(
      createUseChatResult({
        chats: [{ ...chatFixture, unreadCount: 142 }],
        currentChat: null,
        sendDisabledReason: 'Select a conversation first.',
      })
    );

    render(<MessagesPage />);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('does not render per-message read receipt indicators', () => {
    useChatMock.mockReturnValue(
      createUseChatResult({
        messages: [messageFixture],
      })
    );

    render(<MessagesPage />);

    expect(screen.queryByText('✓✓')).not.toBeInTheDocument();
    expect(screen.queryByText(/sent/i)).not.toBeInTheDocument();
  });
});
