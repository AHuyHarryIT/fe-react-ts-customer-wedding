import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthPage } from '@components/pages/AuthPage';
import { useAuthStore } from '@/stores/authStore';
import { initializeAuth } from '@/services/authService';
import { hasAuthSessionHint } from '@/services/authSession';

export const Route = createFileRoute('/auth')({
  beforeLoad: async () => {
    if (!hasAuthSessionHint()) {
      return;
    }

    await initializeAuth();
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AuthPage,
});
