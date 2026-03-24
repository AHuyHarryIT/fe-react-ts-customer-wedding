import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { DashboardPage } from '@/app/components/DashboardPage';
import { requireAuth, mapPageToPath, type AppPage } from '@/shared/routeConfig';

function DashboardComponent() {
  const navigate = useNavigate();

  return (
    <DashboardPage
      onNavigate={(page: string) =>
        navigate({ to: mapPageToPath((page as AppPage) || 'home') as '/' })
      }
    />
  );
}

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: DashboardComponent,
});
