import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BookingDetailPage } from '@components/pages/BookingDetailPage';
import { requireAuth } from '@/shared/routeConfig';

function BookingDetailComponent() {
  const navigate = useNavigate();

  return (
    <BookingDetailPage
      onBack={() => navigate({ to: '/dashboard' })}
      onMessages={() => navigate({ to: '/messages' })}
    />
  );
}

export const Route = createFileRoute('/booking-detail')({
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: BookingDetailComponent,
});
