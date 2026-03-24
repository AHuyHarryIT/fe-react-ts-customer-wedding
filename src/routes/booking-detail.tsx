import { createFileRoute } from '@tanstack/react-router';
import { BookingDetailPage } from '@/app/components/pages/BookingDetailPage';
import { requireAuth } from '@/shared/routeConfig';

function BookingDetailComponent() {
  return <BookingDetailPage onBack={() => window.history.back()} />;
}

export const Route = createFileRoute('/booking-detail')({
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: BookingDetailComponent,
});
