import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PackageDetailPage } from '../PackageDetailPage';

const navigateMock = vi.fn();
const usePackageDetailMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...rest }: { to: string; children?: ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useNavigate: () => navigateMock,
  useParams: () => ({ packageId: 'pkg-1' }),
}));

vi.mock('@components/ui', () => ({
  ProductImageGallery: () => <div data-testid="product-image-gallery" />,
}));

vi.mock('@/components/pages/CustomerStatePanel', () => ({
  CustomerStatePanel: ({
    title,
    description,
    actions,
  }: {
    title: string;
    description?: string;
    actions?: ReactNode;
  }) => (
    <div>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {actions}
    </div>
  ),
}));

vi.mock('@/hooks/usePackageDetail', () => ({
  usePackageDetail: (...args: unknown[]) => usePackageDetailMock(...args),
}));

const activePackageDetail = {
  id: 'pkg-1',
  name: 'Premium Package',
  description: 'Full-day coverage',
  price: 25000000,
  isActive: true,
  services: [
    {
      service: {
        id: 'svc-1',
        name: 'Photography',
        description: 'Full day',
      },
    },
  ],
  images: [],
};

describe('PackageDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePackageDetailMock.mockReturnValue({
      loading: false,
      error: null,
      packageData: activePackageDetail,
    });
  });

  it('uses one primary Book Now CTA to /contact with a subordinate compare action', () => {
    render(<PackageDetailPage />);

    const primaryBookNowLinks = screen.getAllByRole('link', { name: /book now/i });
    expect(primaryBookNowLinks).toHaveLength(1);
    expect(primaryBookNowLinks[0]).toHaveAttribute('href', '/contact');

    const compareAction = screen.getByRole('link', { name: /compare all packages/i });
    expect(compareAction).toHaveAttribute('href', '/packages');
    expect(compareAction.className).toContain('text-sm');
    expect(compareAction.className).toContain('border');
  });

  it('renders unavailable state when package detail is denied or inactive', () => {
    usePackageDetailMock.mockReturnValue({
      loading: false,
      error: null,
      packageData: null,
    });

    render(<PackageDetailPage />);

    expect(screen.getByRole('heading', { name: /package unavailable/i })).toBeInTheDocument();
    expect(screen.getByText('Package not found.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to packages/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /book now/i })).not.toBeInTheDocument();
  });

  it('uses generic unavailable copy instead of exposing denied/internal detail text', () => {
    usePackageDetailMock.mockReturnValue({
      loading: false,
      error: 'Missing permission: packages:read',
      packageData: null,
    });

    render(<PackageDetailPage />);

    expect(screen.getByRole('heading', { name: /package unavailable/i })).toBeInTheDocument();
    expect(screen.getByText('Package not found.')).toBeInTheDocument();
    expect(screen.queryByText('Missing permission: packages:read')).not.toBeInTheDocument();
  });

  it('keeps active package detail rendering stable for package info and CTA hierarchy', () => {
    render(<PackageDetailPage />);

    expect(screen.getByRole('heading', { name: /premium package/i })).toBeInTheDocument();
    expect(screen.getByText('Full-day coverage')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /book now/i })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: /compare all packages/i })).toHaveAttribute(
      'href',
      '/packages'
    );
  });
});
