import { redirect } from '@tanstack/react-router';
import { initializeAuth } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import type { AppPage } from '@/types/routes';
import {
  captureRedirectPath,
  consumeRedirectPath,
  setAuthFeedbackReason,
} from '@/auth/sessionPolicy';

export const normalizeRedirectPath = (value?: string | null): string => {
  if (!value || typeof value !== 'string') {
    return '/dashboard';
  }

  if (!value.startsWith('/')) {
    return '/dashboard';
  }

  if (value === '/auth') {
    return '/dashboard';
  }

  return value;
};

export const buildPathFromLocation = (location?: {
  href?: string;
  pathname?: string;
  searchStr?: string;
}): string => {
  if (!location) {
    return '/dashboard';
  }

  if (location.href) {
    try {
      const url = new URL(location.href, window.location.origin);
      return normalizeRedirectPath(`${url.pathname}${url.search}${url.hash}`);
    } catch {
      return normalizeRedirectPath(location.href);
    }
  }

  const pathname = location.pathname || '/dashboard';
  const search = location.searchStr || '';
  return normalizeRedirectPath(`${pathname}${search}`);
};

export const savePostLoginRedirect = (path: string) => {
  captureRedirectPath(normalizeRedirectPath(path));
};

export const consumePostLoginRedirect = (): string => consumeRedirectPath();

export const requireAuth = async (opts?: {
  location?: { href?: string; pathname?: string; searchStr?: string };
}) => {
  const authStore = useAuthStore.getState();

  if (!authStore.isInitialized) {
    await initializeAuth(true);
  }

  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    return;
  }

  const redirectPath = buildPathFromLocation(opts?.location);
  savePostLoginRedirect(redirectPath);
  setAuthFeedbackReason('login-required');

  throw redirect({ to: '/auth' });
};

export const mapPathToPage = (pathname: string): AppPage => {
  if (pathname === '/') return 'home';
  if (pathname === '/auth') return 'auth';
  if (pathname === '/packages') return 'packages';
  if (pathname.startsWith('/packages/')) return 'package-detail';
  if (pathname === '/bookings' || pathname === '/bookings/') return 'booking';
  if (pathname.startsWith('/bookings/')) return 'booking-detail';
  if (pathname === '/booking') return 'booking';
  if (pathname === '/dashboard') return 'dashboard';
  if (pathname === '/gallery') return 'gallery';
  if (pathname === '/messages') return 'messages';
  if (pathname === '/profile') return 'profile';
  if (pathname === '/contact') return 'contact';
  return 'home';
};

export const mapPageToPath = (page: AppPage): string => {
  switch (page) {
    case 'home':
      return '/';
    case 'auth':
      return '/auth';
    case 'packages':
      return '/packages';
    case 'booking':
      return '/bookings';
    case 'dashboard':
      return '/dashboard';
    case 'booking-detail':
      return '/bookings';
    case 'gallery':
      return '/gallery';
    case 'messages':
      return '/messages';
    case 'profile':
      return '/profile';
    case 'contact':
      return '/contact';
    case 'package-detail':
      return '/packages';
    default:
      return '/';
  }
};
