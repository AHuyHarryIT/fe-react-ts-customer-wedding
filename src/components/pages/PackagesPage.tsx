import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { FiCamera, FiVideo, FiImage, FiCheckCircle, FiSliders } from 'react-icons/fi';
import { motion } from 'motion/react';
import { ImageWithFallback } from '@components/figma/ImageWithFallback';
import { formatMoneyVND } from '@/utils/money';
import { usePackages } from '@/hooks/usePackages';
import defaultImage from '@assets/default-image.svg';

export function PackagesPage() {
  const { packages: apiPackages, loading } = usePackages();
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const budgetFilterId = 'package-budget-filter';
  const serviceFilterId = 'package-service-filter';
  const displayPackages = apiPackages.map((pkg) => ({
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
    image: pkg.coverImageUrl || pkg.images?.[0]?.imageUrl || defaultImage,
    images: pkg.images,
    services: pkg.services,
    isActive: pkg.isActive,
    popular: false,
  }));

  const filteredPackages = displayPackages.filter((pkg) => {
    const budgetMatch =
      selectedBudget === 'all' ||
      (selectedBudget === 'under3000' && pkg.price < 3000) ||
      (selectedBudget === '3000-5000' && pkg.price >= 3000 && pkg.price <= 5000) ||
      (selectedBudget === 'over5000' && pkg.price > 5000);

    const serviceMatch = selectedService === 'all' || pkg.category === selectedService;

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
          <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">Packages</h1>
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
            <FiSliders className="size-5 text-rose-500" />
            <h2 className="font-medium text-gray-800">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Budget Filter */}
            <div>
              <label
                htmlFor={budgetFilterId}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Budget Range
              </label>
              <select
                id={budgetFilterId}
                name="budgetRange"
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
              <label
                htmlFor={serviceFilterId}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Service Type
              </label>
              <select
                id={serviceFilterId}
                name="serviceType"
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
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
              >
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
              >
                <Link
                  to="/packages/$packageId"
                  params={{ packageId: String(pkg.id) }}
                  className="block"
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
                        {pkg.category === 'photography' && (
                          <FiCamera className="size-4 text-rose-500" />
                        )}
                        {pkg.category === 'video' && <FiVideo className="size-4 text-rose-500" />}
                        {pkg.category === 'full-service' && (
                          <FiImage className="size-4 text-rose-500" />
                        )}
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
                          <FiCheckCircle className="size-4 text-rose-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {pkg.features.length > 4 && (
                        <li className="text-sm text-rose-500 font-medium">
                          +{pkg.features.length - 4} more features
                        </li>
                      )}
                    </ul>

                    <span className="block w-full py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full text-center font-medium transition-all hover:shadow-lg">
                      View Details
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                {apiPackages.length === 0
                  ? 'No published packages are available right now.'
                  : 'No packages found matching your criteria.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
