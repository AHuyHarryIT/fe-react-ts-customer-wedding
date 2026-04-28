import { createFileRoute } from '@tanstack/react-router';
import { StaffMessagesPage } from '@components/pages/StaffMessagesPage';
import { requireAuth } from '@/shared/routeConfig';

function StaffMessagesComponent() {
  return <StaffMessagesPage />;
}

export const Route = createFileRoute('/messages/staff')({
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: StaffMessagesComponent,
});
