import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router';
import { MessagesModePage } from '@components/pages/MessagesModePage';
import { requireAuth } from '@/shared/routeConfig';

function MessagesComponent() {
  const location = useLocation();
  const isModePage = location.pathname === '/messages' || location.pathname === '/messages/';

  if (isModePage) {
    return <MessagesModePage />;
  }

  return <Outlet />;
}

export const Route = createFileRoute('/messages')({
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: MessagesComponent,
});
