import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BookingFlowPage } from '@/app/components/pages/BookingFlowPage';
import { requireAuth, mapPageToPath, type AppPage } from '@/shared/routeConfig';

function BookingComponent() {
  const navigate = useNavigate();

  return (
    <BookingFlowPage
      onNavigate={(page: string) =>
        navigate({ to: mapPageToPath((page as AppPage) || 'home') as '/' })
      }
      onBack={() => window.history.back()}
    />
  );
}

export const Route = createFileRoute('/booking')({
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: BookingComponent,
});
