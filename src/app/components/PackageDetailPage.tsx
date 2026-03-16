import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Plus, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface PackageDetailPageProps {
  packageData: any;
  onNavigate: (page: string, data?: any) => void;
  onBack: () => void;
}

export function PackageDetailPage({ packageData, onNavigate, onBack }: PackageDetailPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const galleryImages = [
    packageData.image,
    'https://images.unsplash.com/photo-1765350226723-a96ab0705403?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd2VkZGluZyUyMGNvdXBsZSUyMG91dGRvb3J8ZW58MXx8fHwxNzcwMDU1NTMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1765615197770-a46baa12db63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjByb21hbnRpY3xlbnwxfHx8fDE3NzAxMDkxODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1692167900605-e02666cadb6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwYm91cXVldCUyMGZsb3dlcnN8ZW58MXx8fHwxNzcwMDA5MDU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  ];

  const timeline = [
    { phase: 'Consultation', description: 'Initial meeting to discuss your vision', icon: '💬' },
    { phase: 'Pre-Wedding', description: 'Engagement or pre-wedding photo session', icon: '📸' },
    { phase: 'Wedding Day', description: 'Full coverage of your special day', icon: '💒' },
    { phase: 'Delivery', description: 'Edited photos and videos within 4-6 weeks', icon: '🎁' }
  ];

  const addOns = [
    { name: 'Extra Hour Coverage', price: 350 },
    { name: 'Premium Photo Album', price: 450 },
    { name: 'Drone Footage', price: 600 },
    { name: 'Same Day Edit Video', price: 800 },
    { name: 'Parent Albums', price: 250 },
    { name: 'Canvas Prints', price: 200 }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-8 transition-colors"
        >
          <ChevronLeft className="size-5" />
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
                <ChevronLeft className="size-5 text-gray-800" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 size-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all"
              >
                <ChevronRight className="size-5 text-gray-800" />
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
                    currentImageIndex === index ? 'ring-2 ring-rose-400' : ''
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
              <p className="text-4xl font-medium text-rose-500">
                ${packageData.price.toLocaleString()}
              </p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-medium text-gray-800 mb-4">What's Included</h2>
              <ul className="space-y-3">
                {packageData.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="size-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Process Timeline</h2>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <h3 className="font-medium text-gray-800">{item.phase}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Available Add-ons</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addOns.map((addon, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-rose-100 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="size-4 text-rose-400" />
                      <span className="text-sm text-gray-700">{addon.name}</span>
                    </div>
                    <span className="text-sm font-medium text-rose-500">
                      +${addon.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigate('booking', { package: packageData })}
                className="flex-1 py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-xl transition-all font-medium flex items-center justify-center gap-2"
              >
                <Calendar className="size-5" />
                Book This Package
              </button>
              <button
                onClick={() => onNavigate('contact')}
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
