import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { GalleryPage } from '@components/pages/GalleryPage';
import { mapPageToPath, type AppPage } from '@/shared/routeConfig';

function GalleryComponent() {
  const navigate = useNavigate();

  return (
    <GalleryPage
      onNavigate={(page: string) =>
        navigate({ to: mapPageToPath((page as AppPage) || 'home') as '/' })
      }
    />
  );
}

export const Route = createFileRoute('/gallery')({
  component: GalleryComponent,
});
