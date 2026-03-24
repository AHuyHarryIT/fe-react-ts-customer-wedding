import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { HomePage } from '@components/pages/HomePage';
import { mapPageToPath, type AppPage, type PageNavigationData } from '@/shared/routeConfig';

function HomeComponent() {
  const navigate = useNavigate();

  return (
    <HomePage
      onNavigate={(page: string, data?: PageNavigationData) => {
        if (page === 'package-detail') {
          const packageId = data?.package?.id;
          if (packageId) {
            navigate({ to: '/package/$packageId', params: { packageId: String(packageId) } });
            return;
          }
          navigate({ to: '/packages' });
          return;
        }
        navigate({ to: mapPageToPath((page as AppPage) || 'home') as '/' });
      }}
    />
  );
}

export const Route = createFileRoute('/')({
  component: HomeComponent,
});
