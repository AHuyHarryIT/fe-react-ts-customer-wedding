import { createFileRoute } from '@tanstack/react-router';
import { PackageDetailPage } from '@components/pages/PackageDetailPage';
import { api } from '@/services/apiClient';
import { formatMoneyVND } from '@/utils/money';
import type { Package } from '@/types/package';
import defaultSocialImage from '@assets/default-image.svg';

const normalizeMetaText = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
};

export const Route = createFileRoute('/packages/$packageId')({
  loader: async ({ params }) => {
    try {
      const response = await api.get(`/packages/${params.packageId}`);
      return (response.data?.data || null) as Package | null;
    } catch {
      return null;
    }
  },
  head: ({ loaderData }) => {
    const packageName = normalizeMetaText(loaderData?.name);
    const hasPrice = typeof loaderData?.price === 'number' && Number.isFinite(loaderData.price);
    const packagePrice = hasPrice ? formatMoneyVND(loaderData.price) : null;

    const title = packageName
      ? `${packageName} Package Pricing | Studio HaMy`
      : 'Wedding Package Details | Studio HaMy';

    const description = packageName
      ? packagePrice
        ? `${packageName} starts at ${packagePrice}. Review highlights and contact Studio HaMy to book your wedding date.`
        : `Explore ${packageName} package highlights and contact Studio HaMy to check pricing and reserve your date.`
      : 'Explore Studio HaMy package details, compare inclusions, and contact us to reserve your wedding date.';

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:image', content: defaultSocialImage },
        { name: 'twitter:image', content: defaultSocialImage },
      ],
    };
  },
  component: PackageDetailPage,
});
