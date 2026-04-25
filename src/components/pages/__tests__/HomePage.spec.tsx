import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from '../HomePage';

beforeAll(() => {
  class IOStub implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];

    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  }

  vi.stubGlobal('IntersectionObserver', IOStub);
});

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: { children?: ReactNode }) => <div {...props}>{children}</div>,
    article: ({ children, ...props }: { children?: ReactNode }) => (
      <article {...props}>{children}</article>
    ),
  },
}));

const mockLink = vi.fn(({ to, children }: { to: string; children?: ReactNode }) => (
  <a href={to}>{children}</a>
));

vi.mock('@tanstack/react-router', () => ({
  Link: (props: { to: string; children?: ReactNode }) => mockLink(props),
}));

vi.mock('@/hooks/usePackages', () => ({
  usePackages: () => ({
    packages: [
      {
        id: 'pkg-1',
        name: 'Classic',
        price: 15000000,
        services: [{ service: { name: '8-hour coverage' } }],
      },
    ],
  }),
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes Book Now to /contact, Login to /auth, and shows trust proof in hero', () => {
    render(<HomePage />);

    expect(screen.getByRole('link', { name: /book now/i })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/auth');

    const heroSection = screen.getByText(/your love story/i).closest('section');
    expect(heroSection).not.toBeNull();

    const hero = heroSection as HTMLElement;
    expect(within(hero).getByText('15+ Years Experience')).toBeInTheDocument();
    expect(within(hero).getByText('1000+ Happy Couples')).toBeInTheDocument();
    expect(within(hero).getByText('Award-Winning Team')).toBeInTheDocument();
  });
});
