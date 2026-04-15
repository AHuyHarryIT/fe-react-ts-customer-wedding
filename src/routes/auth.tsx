import { useState } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthPage } from '@components/pages/AuthPage';
import { useAuthStore } from '@/stores/authStore';
import { initializeAuth } from '@/services/authService';
import { hasAuthSessionHint } from '@/services/authSession';
import { consumeAuthFeedbackReason } from '@/auth/sessionPolicy';

function AuthRoutePage() {
  const [feedbackReason] = useState(() => consumeAuthFeedbackReason());
  return <AuthPage feedbackReason={feedbackReason} />;
}

export const Route = createFileRoute('/auth')({
  beforeLoad: async () => {
    const { isAuthenticated, isInitialized } = useAuthStore.getState();

    if (!isInitialized || isAuthenticated || hasAuthSessionHint()) {
      await initializeAuth(true);
    }

    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AuthRoutePage,
});
