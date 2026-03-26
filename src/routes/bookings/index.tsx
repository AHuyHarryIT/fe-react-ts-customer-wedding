import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BookingFlowPage } from '@components/pages/BookingFlowPage';
import { requireAuth } from '@/shared/routeConfig';

function BookingComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  return (
    <BookingFlowPage
      initialPackageId={search.packageId}
      onBack={() => navigate({ to: '/packages' })}
    />
  );
}

export const Route = createFileRoute('/bookings/')({
  validateSearch: (search: Record<string, unknown>) => ({
    packageId: typeof search.packageId === 'string' ? search.packageId : undefined,
  }),
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: BookingComponent,
});
