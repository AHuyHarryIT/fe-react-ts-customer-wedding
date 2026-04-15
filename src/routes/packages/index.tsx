import { createFileRoute } from '@tanstack/react-router';
import { PackagesPage } from '@components/pages/PackagesPage';
import defaultSocialImage from '@assets/default-image.svg';

export const Route = createFileRoute('/packages/')({
  head: () => ({
    meta: [
      { title: 'Wedding Packages & Pricing | Studio HaMy' },
      {
        name: 'description',
        content:
          'Browse Studio HaMy wedding photography and film packages with pricing highlights and key inclusions before booking via contact.',
      },
      { property: 'og:image', content: defaultSocialImage },
      { name: 'twitter:image', content: defaultSocialImage },
    ],
  }),
  component: PackagesPage,
});
