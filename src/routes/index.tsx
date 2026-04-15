import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@components/pages/HomePage';
import defaultSocialImage from '@assets/default-image.svg';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Studio HaMy Wedding Photography | Book Now' },
      {
        name: 'description',
        content:
          'Discover Studio HaMy wedding photography and film services, explore signature packages, and book your date through our contact page.',
      },
      { property: 'og:image', content: defaultSocialImage },
      { name: 'twitter:image', content: defaultSocialImage },
    ],
  }),
  component: HomePage,
});
