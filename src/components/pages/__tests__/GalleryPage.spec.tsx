import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GalleryPage } from '../GalleryPage';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...rest }: { to: string; children?: ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/hooks/usePublicAlbums', () => ({
  usePublicAlbums: () => ({
    loading: false,
    error: null,
    albums: [],
  }),
}));

describe('GalleryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows explicit public/private boundary copy and routes private album access to /auth', () => {
    render(<GalleryPage />);

    expect(screen.getByText(/this page only shows public portfolio work/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /for your private wedding album delivery, please log in to continue securely/i
      )
    ).toBeInTheDocument();

    const privateAlbumLink = screen.getByRole('link', { name: /access my private album/i });
    expect(privateAlbumLink).toHaveAttribute('href', '/auth');
  });
});
