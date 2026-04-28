import { createFileRoute } from '@tanstack/react-router';
import { AiMessagesPage } from '@components/pages/AiMessagesPage';
import { requireAuth } from '@/shared/routeConfig';

function AiMessagesComponent() {
  return <AiMessagesPage />;
}

export const Route = createFileRoute('/messages/ai')({
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: AiMessagesComponent,
});
