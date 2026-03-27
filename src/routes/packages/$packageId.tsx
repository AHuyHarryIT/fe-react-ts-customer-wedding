import { createFileRoute } from '@tanstack/react-router';
import { PackageDetailPage } from '@components/pages/PackageDetailPage';

export const Route = createFileRoute('/packages/$packageId')({
  component: PackageDetailPage,
});
