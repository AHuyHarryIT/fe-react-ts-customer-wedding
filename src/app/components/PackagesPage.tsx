import { useState } from 'react';
import { Camera, Video, Image, CheckCircle, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { formatMoneyVND } from '@/utils/money';
import { usePackages } from '../../hooks/usePackages';

const DEFAULT_PACKAGE_IMAGE =
  'https://images.unsplash.com/photo-1692167900605-e02666cadb6d';

interface PackagesPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function PackagesPage({ onNavigate }: PackagesPageProps) {
  const { packages: apiPackages, loading } = usePackages();
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedService, setSelectedService] = useState('all');

  // Fallback hardcoded packages if API is not available
  const fallbackPackages = [
    {
      id: 1,
      name: 'Essential',
      price: 2499,
      category: 'photography',
      description: 'Perfect for intimate weddings',
      features: [
        '6 Hours Coverage',
        '400+ Edited Photos',
        'Online Gallery',
        'Digital Downloads',
        '1 Photographer'
      ],
      image: 'https://images.unsplash.com/photo-1692167900605-e02666cadb6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwYm91cXVldCUyMGZsb3dlcnN8ZW58MXx8fHwxNzcwMDA5MDU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 2,
      name: 'Premium Photography',
      price: 3999,
      category: 'photography',
      description: 'Complete wedding day coverage',
      features: [
        'Full Day Coverage (10 hours)',
        '800+ Edited Photos',
        'Engagement Session',
        'Premium Album',
        '2 Photographers',
        'USB Drive'
      ],
      image: 'https://images.unsplash.com/photo-1765615197770-a46baa12db63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjByb21hbnRpY3xlbnwxfHx8fDE3NzAxMDkxODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      popular: true
    },
    {
      id: 3,
      name: 'Premium Video',
      price: 4499,
      category: 'video',
      description: 'Cinematic wedding films',
      features: [
        'Full Day Coverage',
        '5-7 Minute Highlight Film',
        'Full Ceremony Video',
        'Drone Footage',
        '2 Videographers',
        '4K Resolution'
      ],
      image: 'https://images.unsplash.com/photo-1720535594328-5e681403350a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcGhvdG9ncmFwaHklMjBzdHVkaW98ZW58MXx8fHwxNzcwMTA5MTgzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 4,
      name: 'Luxury Package',
      price: 5999,
      category: 'full-service',
      description: 'The ultimate wedding experience',
      features: [
        'Unlimited Coverage',
        'Photography + Videography',
        'Engagement + Pre-wedding Session',
        'Same Day Edit',
        'Premium Album + USB',
        'Drone Coverage',
        'Full Team'
      ],
      image: 'https://images.unsplash.com/photo-1765350226723-a96ab0705403?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd2VkZGluZyUyMGNvdXBsZSUyMG91dGRvb3J8ZW58MXx8fHwxNzcwMDU1NTMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      popular: true
    },
    {
      id: 5,
      name: 'Destination Wedding',
      price: 7999,
      category: 'full-service',
      description: 'For weddings away from home',
      features: [
        '3 Days Coverage',
        'Photography + Videography',
        'Travel Included',
        'Multiple Sessions',
        'Full Edit Suite',
        'Premium Deliverables'
      ],
      image: 'https://images.unsplash.com/photo-1622580627463-b03d48e305d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZSUyMGdyb29tJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcwMTA5MTgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 6,
      name: 'Engagement Session',
      price: 599,
      category: 'photography',
      description: 'Pre-wedding photo session',
      features: [
        '2 Hour Session',
        '100+ Edited Photos',
        'Location of Choice',
        'Online Gallery',
        '1 Photographer'
      ],
      image: 'https://images.unsplash.com/photo-1677768062274-fdd45caac233?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwZGV0YWlsc3xlbnwxfHx8fDE3NzAxMDkxODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  // Use API packages if available, else use fallback
  const displayPackages = apiPackages && apiPackages.length > 0
    ? apiPackages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price || 0,
        category: 'photography',
        description: pkg.description || 'Wedding service package',
        features:
          pkg.services && pkg.services.length > 0
            ? pkg.services
                .map((serviceItem) => serviceItem.service?.name)
                .filter((name): name is string => Boolean(name))
            : ['See details for full features'],
        image: pkg.coverImageUrl || pkg.images?.[0]?.imageUrl || DEFAULT_PACKAGE_IMAGE,
        images: pkg.images,
        services: pkg.services,
        isActive: pkg.isActive,
      }))
    : fallbackPackages;

  const filteredPackages = displayPackages.filter((pkg) => {
    const budgetMatch =
      selectedBudget === 'all' ||
      (selectedBudget === 'under3000' && pkg.price < 3000) ||
      (selectedBudget === '3000-5000' && pkg.price >= 3000 && pkg.price <= 5000) ||
      (selectedBudget === 'over5000' && pkg.price > 5000);

    const serviceMatch =
      selectedService === 'all' || pkg.category === selectedService;

    return budgetMatch && serviceMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
            Packages
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect package to capture your special day
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="size-5 text-rose-500" />
            <h2 className="font-medium text-gray-800">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Budget Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="all">All Budgets</option>
                <option value="under3000">Under $3,000</option>
                <option value="3000-5000">$3,000 - $5,000</option>
                <option value="over5000">Over $5,000</option>
              </select>
            </div>

            {/* Service Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="all">All Services</option>
                <option value="photography">Photography Only</option>
                <option value="video">Videography Only</option>
                <option value="full-service">Photography + Video</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-8 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : filteredPackages.length > 0 ? (
            filteredPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group ${
                pkg.popular ? 'ring-2 ring-rose-400' : ''
              }`}
              onClick={() => onNavigate('package-detail', { package: pkg })}
            >
              {pkg.popular && (
                <div className="bg-gradient-to-r from-rose-400 to-pink-500 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className="relative h-56 overflow-hidden">
                <ImageWithFallback
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center gap-1">
                    {pkg.category === 'photography' && <Camera className="size-4 text-rose-500" />}
                    {pkg.category === 'video' && <Video className="size-4 text-rose-500" />}
                    {pkg.category === 'full-service' && <Image className="size-4 text-rose-500" />}
                    <span className="text-xs font-medium text-gray-700 capitalize">
                      {pkg.category === 'full-service' ? 'Photo + Video' : pkg.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-serif text-gray-800 mb-2">{pkg.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
                <p className="text-3xl font-medium text-rose-500 mb-4">
                  {formatMoneyVND(pkg.price)}
                </p>

                <ul className="space-y-2 mb-6">
                  {pkg.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="size-4 text-rose-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {pkg.features.length > 4 && (
                    <li className="text-sm text-rose-500 font-medium">
                      +{pkg.features.length - 4} more features
                    </li>
                  )}
                </ul>

                <button className="w-full py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all font-medium">
                  View Details
                </button>
              </div>
            </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No packages found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
