import { createFileRoute } from '@tanstack/react-router';
import { ContactPage } from '@components/pages/ContactPage';
import defaultSocialImage from '@assets/default-image.svg';

function ContactComponent() {
  return <ContactPage />;
}

export const Route = createFileRoute('/contact')({
  head: () => ({
    meta: [
      { title: 'Contact Studio HaMy | Book Your Wedding Date' },
      {
        name: 'description',
        content:
          'Share your wedding date and vision with Studio HaMy. Our team will follow up with package guidance and availability details.',
      },
      { property: 'og:image', content: defaultSocialImage },
      { name: 'twitter:image', content: defaultSocialImage },
    ],
  }),
  component: ContactComponent,
});
