import { useEffect } from 'react';
import { Outlet, useNavigate, useRouterState, createRootRoute, redirect } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { Navigation } from '@/app/components/Navigation';
import { Footer } from '@/app/components/Footer';
import { useAuthStore } from '@/stores/authStore';
import { initializeAuth } from '@/services/authService';
import {
  mapPathToPage,
  mapPageToPath,
  savePostLoginRedirect,
  type AppPage,
} from '@/shared/routeConfig';

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

export const Route = createRootRoute({
  component: RootLayout,
});
