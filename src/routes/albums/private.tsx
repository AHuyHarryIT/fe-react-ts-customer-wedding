import { createFileRoute } from '@tanstack/react-router';
import { CustomerPrivateAlbumsPage } from '@/components/pages/CustomerPrivateAlbumsPage';
import { requireAuth } from '@/shared/routeConfig';

export const Route = createFileRoute('/albums/private')({
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: CustomerPrivateAlbumsPage,
});
