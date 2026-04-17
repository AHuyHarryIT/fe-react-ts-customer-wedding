import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/shared/routeConfig';

function PrivateAlbumsRoutePlaceholder() {
  return null;
}

export const Route = createFileRoute('/albums/private')({
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: PrivateAlbumsRoutePlaceholder,
});
