import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { CustomerPrivateAlbumsPage } from '@/components/pages/CustomerPrivateAlbumsPage';
import type { CustomerPrivateAlbumCard } from '@/types/album';

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

const makeAlbumCard = (overrides: Partial<CustomerPrivateAlbumCard> = {}): CustomerPrivateAlbumCard => ({
  id: 'album-1',
  title: 'Private Wedding Album',
  bookingId: 'booking-1',
  bookingReference: 'BOOK-001',
  eventDate: '2026-10-20T00:00:00.000Z',
  deliveredAssetCount: 24,
  coverFile: null,
  zipDownloadUrl: 'http://localhost:3000/customer/albums/album-1/download.zip',
  assets: [
    {
      id: 'asset-1',
      name: 'highlight.jpg',
      mimeType: 'image/jpeg',
      byteSize: 1200,
      protectedMedia: {
        thumbnailUrl: 'http://localhost:3000/customer/albums/file/asset-1/thumbnail',
        contentUrl: 'http://localhost:3000/customer/albums/file/asset-1/content',
      },
    },
    {
      id: 'asset-2',
      name: 'dance.mov',
      mimeType: 'video/quicktime',
      byteSize: 2200,
      protectedMedia: {
        thumbnailUrl: 'http://localhost:3000/customer/albums/file/asset-2/thumbnail',
        contentUrl: 'http://localhost:3000/customer/albums/file/asset-2/content',
      },
    },
  ],
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
    expect(screen.getByRole('link', { name: /open messages/i })).toHaveAttribute('href', '/messages');
  });

  it('renders empty state copy with required heading and messages follow-up guidance', () => {
    useCustomerPrivateAlbumsMock.mockReturnValue({
      albums: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CustomerPrivateAlbumsPage />);

    expect(screen.getByTestId('state-empty')).toBeInTheDocument();
    expect(screen.getByText('No private albums available yet')).toBeInTheDocument();
    expect(
      screen.getByText(
        /your delivered photos and videos will appear here once the studio publishes your private album/i
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open messages/i })).toHaveAttribute('href', '/messages');
  });

  it('opens inline preview modal from private album cards with no new-tab preview links', () => {
    useCustomerPrivateAlbumsMock.mockReturnValue({
      albums: [makeAlbumCard({ title: 'Ceremony Highlights', bookingReference: 'BOOK-101' })],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CustomerPrivateAlbumsPage />);

    const card = screen.getAllByRole('article')[0];
    const previewTrigger = within(card).getByRole('button', { name: /preview/i });

    fireEvent.click(previewTrigger);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText(/ceremony highlights/i)).toBeInTheDocument();
    expect(within(modal).getByRole('img', { name: /asset preview/i })).toHaveAttribute(
      'src',
      'http://localhost:3000/customer/albums/file/asset-1/thumbnail'
    );

    const allAnchors = within(card).queryAllByRole('link');
    expect(allAnchors.every((anchor) => anchor.getAttribute('target') !== '_blank')).toBe(true);
  });

  it('uses exact Download Album ZIP label and direct zip endpoint with download intent', () => {
    useCustomerPrivateAlbumsMock.mockReturnValue({
      albums: [
        makeAlbumCard({
          id: 'album-zip',
          title: 'Reception Moments',
          zipDownloadUrl: 'http://localhost:3000/customer/albums/album-zip/download.zip',
        }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CustomerPrivateAlbumsPage />);

    const card = screen.getAllByRole('article')[0];
    const downloadLink = within(card).getByRole('link', { name: 'Download Album ZIP' });

    expect(downloadLink).toHaveAttribute(
      'href',
      'http://localhost:3000/customer/albums/album-zip/download.zip'
    );
    expect(downloadLink).toHaveAttribute('download');
    expect(downloadLink).not.toHaveAttribute('target', '_blank');
  });

  it('renders unauthorized-safe copy and Open Messages recovery CTA when assets are unavailable', () => {
    useCustomerPrivateAlbumsMock.mockReturnValue({
      albums: [
        makeAlbumCard({
          id: 'album-denied',
          title: 'Denied Album',
          assets: [],
        }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CustomerPrivateAlbumsPage />);

    const card = screen.getAllByRole('article')[0];
    expect(within(card).getByText(/album not found or you do not have access/i)).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: /open messages/i })).toHaveAttribute(
      'href',
      '/messages'
    );
  });
});
