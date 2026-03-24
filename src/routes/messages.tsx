import { createFileRoute } from '@tanstack/react-router';
import { MessagesPage } from '@components/pages/MessagesPage';
import { requireAuth } from '@/shared/routeConfig';

function MessagesComponent() {
  return <MessagesPage />;
}

export const Route = createFileRoute('/messages')({
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: MessagesComponent,
});
