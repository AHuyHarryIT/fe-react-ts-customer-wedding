import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PackageDetailPage } from '@components/pages/PackageDetailPage';
import { usePackageDetail } from '@/hooks/usePackageDetail';
import { mapPageToPath, type AppPage } from '@/shared/routeConfig';

interface PackageParams {
  packageId: string;
}

function PackageDetailComponent() {
  const navigate = useNavigate();
  const params = Route.useParams() as PackageParams;
  const { packageData } = usePackageDetail(params.packageId);

  const fallbackPackage = {
    id: params.packageId,
    name: `Package #${params.packageId}`,
    price: 0,
    description: 'Selected package details',
    features: [],
    image: '',
  };

  return (
    <PackageDetailPage
      packageData={packageData || fallbackPackage}
      onNavigate={(page: string) => {
        if (page === 'booking') {
          navigate({ to: '/booking' });
          return;
        }
        navigate({ to: mapPageToPath((page as AppPage) || 'home') as '/' });
      }}
      onBack={() => window.history.back()}
    />
  );
}

export const Route = createFileRoute('/packages/$packageId')({
  component: PackageDetailComponent,
});
