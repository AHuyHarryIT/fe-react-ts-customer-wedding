import { useEffect } from 'react';
import {
  RouterProvider,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { PackagesPage } from './components/PackagesPage';
import { PackageDetailPage } from './components/PackageDetailPage';
import { BookingFlowPage } from './components/BookingFlowPage';
import { DashboardPage } from './components/DashboardPage';
import { BookingDetailPage } from './components/BookingDetailPage';
import { GalleryPage } from './components/GalleryPage';
import { MessagesPage } from './components/MessagesPage';
import { ProfilePage } from './components/ProfilePage';
import { ContactPage } from './components/ContactPage';
import { useAuthStore } from '../stores/authStore';
import { initializeAuth } from '../services/authService';

const POST_LOGIN_REDIRECT_KEY = 'post_login_redirect';

const normalizeRedirectPath = (value?: string | null): string => {
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

const buildPathFromLocation = (location?: {
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

const savePostLoginRedirect = (path: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, normalizeRedirectPath(path));
};

const consumePostLoginRedirect = (): string => {
  if (typeof window === 'undefined') {
    return '/dashboard';
  }

  const stored = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
  if (stored) {
    sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  }

  return normalizeRedirectPath(stored);
};

const requireAuth = (opts?: {
  location?: { href?: string; pathname?: string; searchStr?: string };
}) => {
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    return;
  }

  const redirectPath = buildPathFromLocation(opts?.location);
  savePostLoginRedirect(redirectPath);

  throw redirect({ to: '/auth' });
};

type AppPage =
  | 'home'
  | 'auth'
  | 'packages'
  | 'package-detail'
  | 'booking'
  | 'dashboard'
  | 'booking-detail'
  | 'gallery'
  | 'messages'
  | 'profile'
  | 'contact';

function mapPathToPage(pathname: string): AppPage {
  if (pathname === '/') return 'home';
  if (pathname === '/auth') return 'auth';
  if (pathname === '/packages') return 'packages';
  if (pathname.startsWith('/package/')) return 'package-detail';
  if (pathname === '/booking') return 'booking';
  if (pathname === '/dashboard') return 'dashboard';
  if (pathname === '/booking-detail') return 'booking-detail';
  if (pathname === '/gallery') return 'gallery';
  if (pathname === '/messages') return 'messages';
  if (pathname === '/profile') return 'profile';
  if (pathname === '/contact') return 'contact';
  return 'home';
}

function mapPageToPath(page: AppPage): string {
  switch (page) {
    case 'home':
      return '/';
    case 'auth':
      return '/auth';
    case 'packages':
      return '/packages';
    case 'booking':
      return '/booking';
    case 'dashboard':
      return '/dashboard';
    case 'booking-detail':
      return '/booking-detail';
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
}

function RootLayout() {
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const pathname = location.pathname;
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (pathname !== '/auth') {
      const fullPath = `${location.pathname}${location.searchStr || ''}${location.hash || ''}`;
      savePostLoginRedirect(fullPath);
    }
  }, [location.hash, location.pathname, location.searchStr, pathname]);

  const handleNavigate = (page: string) => {
    const mapped = mapPageToPath((page as AppPage) || 'home');
    navigate({ to: mapped as '/' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    clearAuth();
    navigate({ to: '/' });
  };

  const currentPage = mapPathToPage(pathname);

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isLoggedIn={isAuthenticated && !!user}
        onLogout={handleLogout}
      />

      <main>
        <Outlet />
      </main>

      <Footer />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            color: '#1f2937',
            border: '1px solid #fecdd3',
          },
        }}
      />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    const navigate = useNavigate();
    return (
      <HomePage
        onNavigate={(page: string, data?: any) => {
          if (page === 'package-detail') {
            const packageId = data?.package?.id;
            if (packageId) {
              navigate({ to: '/package/$packageId', params: { packageId: String(packageId) } });
              return;
            }
            navigate({ to: '/packages' });
            return;
          }
          navigate({ to: mapPageToPath((page as AppPage) || 'home') as '/' });
        }}
      />
    );
  },
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      const redirectPath = consumePostLoginRedirect();
      throw redirect({ to: redirectPath as '/' });
    }
  },
  component: () => {
    const navigate = useNavigate();

    return (
      <AuthPage
        onLogin={() => {
          const redirectPath = consumePostLoginRedirect();
          navigate({ to: redirectPath as '/' });
        }}
      />
    );
  },
});

const packagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/packages',
  component: () => {
    const navigate = useNavigate();
    return (
      <PackagesPage
        onNavigate={(page: string, data?: any) => {
          if (page === 'package-detail') {
            const packageId = data?.package?.id;
            if (packageId) {
              navigate({ to: '/package/$packageId', params: { packageId: String(packageId) } });
              return;
            }
            navigate({ to: '/packages' });
            return;
          }
          navigate({ to: mapPageToPath((page as AppPage) || 'home') as '/' });
        }}
      />
    );
  },
});

const packageDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/package/$packageId',
  component: () => {
    const navigate = useNavigate();
    const packageId = useRouterState({ select: (s) => s.location.pathname.split('/').pop() || '' });

    const fallbackPackage = {
      id: packageId,
      name: `Package #${packageId}`,
      price: 0,
      description: 'Selected package details',
      features: [],
      image: '',
    };

    return (
      <PackageDetailPage
        packageData={fallbackPackage}
        onNavigate={(page: string) => {
          if (page === 'booking') {
            navigate({ to: '/booking' });
            return;
          }
          navigate({ to: mapPageToPath((page as AppPage) || 'home') as '/' });
        }}
        onBack={() => window.history.back()}
      />
    );
  },
});

const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/booking',
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: () => {
    const navigate = useNavigate();
    return (
      <BookingFlowPage
        onNavigate={(page: string) =>
          navigate({ to: mapPageToPath((page as AppPage) || 'home') as '/' })
        }
        onBack={() => window.history.back()}
      />
    );
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: () => {
    const navigate = useNavigate();
    return (
      <DashboardPage
        onNavigate={(page: string) =>
          navigate({ to: mapPageToPath((page as AppPage) || 'home') as '/' })
        }
      />
    );
  },
});

const bookingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/booking-detail',
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: () => <BookingDetailPage onBack={() => window.history.back()} />,
});

const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gallery',
  component: () => {
    const navigate = useNavigate();
    return (
      <GalleryPage
        onNavigate={(page: string) =>
          navigate({ to: mapPageToPath((page as AppPage) || 'home') as '/' })
        }
      />
    );
  },
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages',
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: () => <MessagesPage />,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: () => <ProfilePage />,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: () => <ContactPage />,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  authRoute,
  packagesRoute,
  packageDetailRoute,
  bookingRoute,
  dashboardRoute,
  bookingDetailRoute,
  galleryRoute,
  messagesRoute,
  profileRoute,
  contactRoute,
]);

export const router = createRouter({
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}
