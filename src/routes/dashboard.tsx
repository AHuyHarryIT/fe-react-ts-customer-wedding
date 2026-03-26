import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@components/pages/DashboardPage';
import { requireAuth } from '@/shared/routeConfig';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: DashboardPage,
});
