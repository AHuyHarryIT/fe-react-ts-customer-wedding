import { createFileRoute } from '@tanstack/react-router';
import { GalleryPage } from '@components/pages/GalleryPage';

export const Route = createFileRoute('/gallery')({
  component: GalleryPage,
});
