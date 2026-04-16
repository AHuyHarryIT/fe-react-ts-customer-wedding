import { createFileRoute } from '@tanstack/react-router';
import { BookingFlowPage } from '@components/pages/BookingFlowPage';
import { requireAuth } from '@/shared/routeConfig';

export const Route = createFileRoute('/booking')({
  validateSearch: (search: Record<string, unknown>) => ({
    packageId: typeof search.packageId === 'string' ? search.packageId : undefined,
  }),
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: BookingFlowPage,
});
