import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AuthPage } from '@components/pages/AuthPage';
import { useAuthStore } from '@/stores/authStore';
import { consumePostLoginRedirect } from '@/shared/routeConfig';

function AuthComponent() {
  const navigate = useNavigate();

  return (
    <AuthPage
      onLogin={() => {
        const redirectPath = consumePostLoginRedirect();
        navigate({ to: redirectPath as '/' });
      }}
    />
  );
}

export const Route = createFileRoute('/auth')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      const redirectPath = consumePostLoginRedirect();
      throw new Error(`Redirect to ${redirectPath}`);
    }
  },
  component: AuthComponent,
});
