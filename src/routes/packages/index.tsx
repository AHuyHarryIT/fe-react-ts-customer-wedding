import { createFileRoute } from '@tanstack/react-router';
import { PackagesPage } from '@components/pages/PackagesPage';

export const Route = createFileRoute('/packages/')({
  component: PackagesPage,
});
