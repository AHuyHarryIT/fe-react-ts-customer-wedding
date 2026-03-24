import { useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiCalendar,
  FiPhone,
  FiCamera
} from 'react-icons/fi';
import { motion } from "motion/react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { formatMoneyVND } from "@/utils/money";
import type { Package } from "../../hooks/usePackages";

interface PackageDetailPageProps {
  packageData: Package & {
    image?: string;
    features?: string[];
    category?: string;
  };
  onNavigate: (page: string, data?: any) => void;
  onBack: () => void;
}

export function PackageDetailPage({
  packageData,
  onNavigate,
  onBack,
}: PackageDetailPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const includedServices = (packageData.services || [])
    .map((item) => item.service)
    .filter(
      (
        service,
      ): service is NonNullable<
        NonNullable<Package["services"]>[number]["service"]
      > => Boolean(service),
    );

  const apiGalleryImages = (packageData.images || [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => item.imageUrl)
    .filter(Boolean);

  const galleryImages = [
    packageData.coverImageUrl || packageData.image || apiGalleryImages[0],
    ...apiGalleryImages,
  ].filter(
    (img, idx, arr): img is string => Boolean(img) && arr.indexOf(img) === idx,
  );

  const TimelineIcons = {
    Consultation: FiPhone,
    'Pre-Wedding': FiCamera,
    'Wedding Day': FiCalendar,
    Delivery: FiCheckCircle
  };

  const timeline = [
    { phase: 'Consultation', description: 'Initial meeting to discuss your vision' },
    { phase: 'Pre-Wedding', description: 'Engagement or pre-wedding photo session' },
    { phase: 'Wedding Day', description: 'Full coverage of your special day' },
    { phase: 'Delivery', description: 'Edited photos and videos within 4-6 weeks' }
  ];


  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-8 transition-colors"
        >
          <FiChevronLeft className="size-5" />
          Back to Packages
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
              <ImageWithFallback
                src={galleryImages[currentImageIndex]}
                alt={`${packageData.name} ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 size-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all"
              >
                <FiChevronLeft className="size-5 text-gray-800" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 size-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all"
              >
                <FiChevronRight className="size-5 text-gray-800" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {galleryImages.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative flex-1 aspect-square rounded-lg overflow-hidden ${
                    currentImageIndex === index ? "ring-2 ring-rose-400" : ""
                  }`}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Package Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl font-serif text-gray-800 mb-2">
                {packageData.name}
              </h1>
              <p className="text-gray-600 mb-4">{packageData.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-sm bg-rose-100 text-rose-700">
                  {packageData.services?.length || 0} Services
                </span>
                <span
                  className={
                    `px-3 py-1 rounded-full text-sm ` +
                    (packageData.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500")
                  }
                >
                  {packageData.isActive ? "Available" : "On Request"}
                </span>
              </div>
              <p className="text-4xl font-medium text-rose-500">
                {formatMoneyVND(packageData.price)}
              </p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-medium text-gray-800 mb-4">
                What's Included
              </h2>
              {includedServices.length > 0 ? (
                <ul className="space-y-3">
                  {includedServices.map((service) => (
                    <li
                      key={service.id}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <FiCheckCircle className="size-5 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-gray-700 font-medium">
                            {service.name}
                          </p>
                          {service.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">
                  No services included in this package.
                </p>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-medium text-gray-800 mb-4">
                Process Timeline
              </h2>
              <div className="space-y-4">
                {timeline.map((item, index) => {
                  const IconComponent = TimelineIcons[item.phase as keyof typeof TimelineIcons];
                  return (
                    <div key={index} className="flex gap-4">
                      {IconComponent && <IconComponent className="size-6 text-rose-400 flex-shrink-0" />}
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {item.phase}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigate("booking", { package: packageData })}
                className="flex-1 py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-xl transition-all font-medium flex items-center justify-center gap-2"
              >
                <FiCalendar className="size-5" />
                Book This Package
              </button>
              <button
                onClick={() => onNavigate("contact")}
                className="flex-1 py-4 border-2 border-rose-400 text-rose-500 rounded-full hover:bg-rose-50 transition-all font-medium"
              >
                Request Consultation
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
