import { createFileRoute } from '@tanstack/react-router';
import { BookingDetailPage } from '@components/pages/BookingDetailPage';
import { requireAuth } from '@/shared/routeConfig';

export const Route = createFileRoute('/bookings/$id')({
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: BookingDetailPage,
});
