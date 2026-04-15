import { useEffect } from 'react';
import { Outlet, useNavigate, useRouterState, createRootRoute } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/stores/authStore';
import { authApi, initializeAuth } from '@/services/authService';
import { savePostLoginRedirect } from '@/shared/routeConfig';

function RootLayout() {
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const pathname = location.pathname;
  const { isAuthenticated, isInitialized, user } = useAuthStore();

  useEffect(() => {
    const authState = useAuthStore.getState();
    if (!authState.isInitialized) {
      void initializeAuth(true);
    }
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

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      navigate({ to: '/' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation isLoggedIn={isAuthenticated && !!user} onLogout={handleLogout} />

      <main>
        {!isInitialized ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
              <p className="text-sm text-gray-500">Checking your session...</p>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
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
