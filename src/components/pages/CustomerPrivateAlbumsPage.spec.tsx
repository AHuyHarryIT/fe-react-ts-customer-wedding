import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { CustomerPrivateAlbumsPage } from '@/components/pages/CustomerPrivateAlbumsPage';
import type { CustomerPrivateAlbum } from '@/types/album';

const { useCustomerPrivateAlbumsMock } = vi.hoisted(() => ({
  useCustomerPrivateAlbumsMock: vi.fn(),
}));

vi.mock('@/hooks/useCustomerPrivateAlbums', () => ({
  useCustomerPrivateAlbums: useCustomerPrivateAlbumsMock,
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...rest }: { to: string; children?: ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/pages/CustomerStatePanel', () => ({
  CustomerStatePanel: ({
    tone,
    title,
    description,
    actions,
    children,
  }: {
    tone: string;
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
    children?: ReactNode;
  }) => (
    <section data-testid={`state-${tone}`}>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {children}
      {actions}
    </section>
  ),
}));

const makeAlbum = (overrides: Partial<CustomerPrivateAlbum>): CustomerPrivateAlbum => ({
  id: 'album-1',
  title: 'Private Wedding Album',
  bookingId: 'booking-1',
  eventDate: '2026-10-20T00:00:00.000Z',
  deliveredAssetCount: 24,
  coverFile: null,
  ...overrides,
});

describe('CustomerPrivateAlbumsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state while private albums are being fetched', () => {
    useCustomerPrivateAlbumsMock.mockReturnValue({
      albums: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<CustomerPrivateAlbumsPage />);

    expect(screen.getByTestId('state-loading')).toBeInTheDocument();
    expect(screen.getByText(/loading your private albums/i)).toBeInTheDocument();
  });

  it('renders error state and retry action when private album fetch fails', () => {
    const refetchMock = vi.fn();

    useCustomerPrivateAlbumsMock.mockReturnValue({
      albums: [],
      loading: false,
      error: 'Unable to fetch private albums',
      refetch: refetchMock,
    });

    render(<CustomerPrivateAlbumsPage />);

    expect(screen.getByTestId('state-error')).toBeInTheDocument();
    expect(screen.getByText(/we could not load your private albums/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders empty state copy when no private albums are available', () => {
    useCustomerPrivateAlbumsMock.mockReturnValue({
      albums: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CustomerPrivateAlbumsPage />);

    expect(screen.getByTestId('state-empty')).toBeInTheDocument();
    expect(screen.getByText(/no private albums yet/i)).toBeInTheDocument();
    expect(screen.getByText(/your photographer will publish your private delivery album here/i)).toBeInTheDocument();
  });

  it('renders responsive private album delivery cards with required details', () => {
    useCustomerPrivateAlbumsMock.mockReturnValue({
      albums: [
        makeAlbum({ id: 'album-1', title: 'Ceremony Highlights', deliveredAssetCount: 18 }),
        makeAlbum({
          id: 'album-2',
          title: 'Reception Moments',
          eventDate: null,
          deliveredAssetCount: 9,
        }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CustomerPrivateAlbumsPage />);

    expect(screen.getByText(/private albums/i)).toBeInTheDocument();

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(2);

    const firstCard = cards[0];
    expect(within(firstCard).getByText(/ceremony highlights/i)).toBeInTheDocument();
    expect(within(firstCard).getByText(/18 assets/i)).toBeInTheDocument();

    const secondCard = cards[1];
    expect(within(secondCard).getByText(/reception moments/i)).toBeInTheDocument();
    expect(within(secondCard).getByText(/event date pending/i)).toBeInTheDocument();
  });
});
