import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PackageDetailPage } from '@components/pages/PackageDetailPage';
import { usePackageDetail } from '@/hooks/usePackageDetail';
import type { PackageParams } from '@/types/package';

function PackageDetailComponent() {
  const navigate = useNavigate();
  const params = Route.useParams() as PackageParams;
  const { packageData, loading, error } = usePackageDetail(params.packageId);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-sm text-gray-500">Loading package details…</div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
          <p className="mb-4 text-gray-600">{error || 'Package not found.'}</p>
          <button
            onClick={() => navigate({ to: '/packages' })}
            className="rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white"
          >
            Back to packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <PackageDetailPage packageData={packageData} onBack={() => navigate({ to: '/packages' })} />
  );
}

export const Route = createFileRoute('/packages/$packageId')({
  component: PackageDetailComponent,
});
