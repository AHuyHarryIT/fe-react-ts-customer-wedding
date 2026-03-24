import { createFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '@components/pages/ProfilePage';
import { requireAuth } from '@/shared/routeConfig';

function ProfileComponent() {
  return <ProfilePage />;
}

export const Route = createFileRoute('/profile')({
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: ProfileComponent,
});
