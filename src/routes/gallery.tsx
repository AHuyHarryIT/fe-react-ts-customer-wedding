import { createFileRoute } from '@tanstack/react-router';
import { GalleryPage } from '@components/pages/GalleryPage';
import defaultSocialImage from '@assets/default-image.svg';

export const Route = createFileRoute('/gallery')({
  head: () => ({
    meta: [
      { title: 'Wedding Portfolio Gallery | Studio HaMy' },
      {
        name: 'description',
        content:
          'View Studio HaMy wedding portfolio highlights and continue to login for private client album access when invited.',
      },
      { property: 'og:image', content: defaultSocialImage },
      { name: 'twitter:image', content: defaultSocialImage },
    ],
  }),
  component: GalleryPage,
});
