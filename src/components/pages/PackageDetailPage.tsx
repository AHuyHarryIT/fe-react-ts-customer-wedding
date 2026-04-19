import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { FiChevronLeft, FiCheckCircle, FiCalendar, FiPhone, FiCamera } from 'react-icons/fi';
import { motion } from 'motion/react';
import { ProductImageGallery } from '@components/ui';
import { CustomerStatePanel } from '@/components/pages/CustomerStatePanel';
import { usePackageDetail } from '@/hooks/usePackageDetail';
import { formatMoneyVND } from '@/utils/money';
import type { Package } from '@/types/package';
import defaultImage from '@assets/default-image.svg';

export function PackageDetailPage() {
  const navigate = useNavigate();
  const { packageId } = useParams({ from: '/packages/$packageId' });
  const { packageData, loading, error } = usePackageDetail(packageId);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <CustomerStatePanel
            tone="loading"
            eyebrow="Packages"
            title="Loading package details"
            description="We are pulling the package images, included services, and pricing."
          />
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <CustomerStatePanel
            tone="error"
            eyebrow="Packages"
            title="Package unavailable"
            description="Package not found."
            actions={
              <button
                onClick={() => navigate({ to: '/packages' })}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white"
              >
                Back to packages
              </button>
            }
          />
        </div>
      </div>
    );
  }

  const includedServices = (packageData.services || [])
    .map((item) => item.service)
    .filter(
      (service): service is NonNullable<NonNullable<Package['services']>[number]['service']> =>
        Boolean(service)
    );

  const apiGalleryImages = (packageData.images || [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => item.imageUrl)
    .filter(Boolean);

  const galleryImages = [
    apiGalleryImages[0] || defaultImage,
    packageData.coverImageUrl || packageData.image || apiGalleryImages[0],
    ...apiGalleryImages,
  ]
    .filter((img, idx, arr): img is string => Boolean(img) && arr.indexOf(img) === idx)
    .map((image, index) => ({
      id: `${packageData.id}-${index}`,
      src: image,
      alt: `${packageData.name} image ${index + 1}`,
    }));

  const TimelineIcons = {
    Consultation: FiPhone,
    'Pre-Wedding': FiCamera,
    'Wedding Day': FiCalendar,
    Delivery: FiCheckCircle,
  };

  const timeline = [
    { phase: 'Consultation', description: 'Initial meeting to discuss your vision' },
    { phase: 'Pre-Wedding', description: 'Engagement or pre-wedding photo session' },
    { phase: 'Wedding Day', description: 'Full coverage of your special day' },
    { phase: 'Delivery', description: 'Edited photos and videos within 4-6 weeks' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate({ to: '/packages' })}
          className="flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-8 transition-colors"
        >
          <FiChevronLeft className="size-5" />
          Back to Packages
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <ProductImageGallery images={galleryImages} name={packageData.name} />
          </motion.div>

          {/* Package Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl font-serif text-gray-800 mb-2">{packageData.name}</h1>
              <p className="text-gray-600 mb-4">{packageData.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-sm bg-rose-100 text-rose-700">
                  {packageData.services?.length || 0} Services
                </span>
                <span
                  className={
                    `px-3 py-1 rounded-full text-sm ` +
                    (packageData.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500')
                  }
                >
                  {packageData.isActive ? 'Available' : 'On Request'}
                </span>
              </div>
              <p className="text-4xl font-medium text-rose-500">
                {formatMoneyVND(packageData.price)}
              </p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-medium text-gray-800 mb-4">What's Included</h2>
              {includedServices.length > 0 ? (
                <ul className="space-y-3">
                  {includedServices.map((service) => (
                    <li key={service.id} className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <FiCheckCircle className="size-5 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-gray-700 font-medium">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No services included in this package.</p>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Process Timeline</h2>
              <div className="space-y-4">
                {timeline.map((item, index) => {
                  const IconComponent = TimelineIcons[item.phase as keyof typeof TimelineIcons];
                  return (
                    <div key={index} className="flex gap-4">
                      {IconComponent && (
                        <IconComponent className="size-6 text-rose-400 flex-shrink-0" />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-800">{item.phase}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:items-start">
              <Link
                to="/contact"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-8 py-4 font-medium text-white transition-all hover:shadow-xl sm:w-auto"
              >
                Book Now
              </Link>
              <Link
                to="/packages"
                className="inline-flex w-full items-center justify-center rounded-full border border-rose-300 px-8 py-3 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50 sm:w-auto"
              >
                Compare all packages
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
