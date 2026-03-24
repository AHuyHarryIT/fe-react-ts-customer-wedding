import { createFileRoute } from '@tanstack/react-router';
import { ContactPage } from '@/app/components/pages/ContactPage';

function ContactComponent() {
  return <ContactPage />;
}

export const Route = createFileRoute('/contact')({
  component: ContactComponent,
});
