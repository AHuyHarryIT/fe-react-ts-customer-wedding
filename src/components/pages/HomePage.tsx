import { Link } from '@tanstack/react-router';
import { Camera, Award, Heart, Users, ArrowRight, Star, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '@components/figma/ImageWithFallback';
import { usePackages } from '@/hooks/usePackages';
import { formatMoneyVND } from '@/utils/money';

export function HomePage() {
  const { packages } = usePackages({ limit: 3 });
  const features = [
    {
      icon: Camera,
      title: '15+ Years Experience',
      description: 'Expert photographers capturing timeless moments',
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: 'Recognized for excellence in wedding photography',
    },
    {
      icon: Heart,
      title: 'Personalized Service',
      description: 'Tailored packages to match your vision',
    },
    {
      icon: Users,
      title: '1000+ Happy Couples',
      description: 'Creating beautiful memories since 2010',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah & Michael',
      text: 'Studio HaMy captured our wedding day perfectly. Every photo tells a story!',
      rating: 5,
      image:
        'https://images.unsplash.com/photo-1622580627463-b03d48e305d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZSUyMGdyb29tJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcwMTA5MTgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Emily & David',
      text: 'Professional, creative, and so easy to work with. Our photos are absolutely stunning!',
      rating: 5,
      image:
        'https://images.unsplash.com/photo-1765350226723-a96ab0705403?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd2VkZGluZyUyMGNvdXBsZSUyMG91dGRvb3J8ZW58MXx8fHwxNzcwMDU1NTMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Jessica & Ryan',
      text: 'They made us feel so comfortable and the results exceeded all our expectations!',
      rating: 5,
      image:
        'https://images.unsplash.com/photo-1765615197770-a46baa12db63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjByb21hbnRpY3xlbnwxfHx8fDE3NzAxMDkxODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
  ];

  const galleryImages = [
    'https://images.unsplash.com/photo-1765350226723-a96ab0705403?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd2VkZGluZyUyMGNvdXBsZSUyMG91dGRvb3J8ZW58MXx8fHwxNzcwMDU1NTMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1765615197770-a46baa12db63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjByb21hbnRpY3xlbnwxfHx8fDE3NzAxMDkxODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1692167900605-e02666cadb6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwYm91cXVldCUyMGZsb3dlcnN8ZW58MXx8fHwxNzcwMDA5MDU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1720535594328-5e681403350a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcGhvdG9ncmFwaHklMjBzdHVkaW98ZW58MXx8fHwxNzcwMTA5MTgzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1622580627463-b03d48e305d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZSUyMGdyb29tJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcwMTA5MTgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1677768062274-fdd45caac233?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwZGV0YWlsc3xlbnwxfHx8fDE3NzAxMDkxODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  ];

  const featuredPackages = packages.slice(0, 3).map((pkg, index) => ({
    id: pkg.id,
    name: pkg.name,
    price: formatMoneyVND(pkg.price),
    features:
      pkg.services && pkg.services.length > 0
        ? pkg.services
            .map((serviceItem) => serviceItem.service?.name)
            .filter((name): name is string => Boolean(name))
            .slice(0, 3)
        : ['See package detail for included services'],
    image:
      pkg.coverImageUrl ||
      pkg.images?.[0]?.imageUrl ||
      'https://images.unsplash.com/photo-1692167900605-e02666cadb6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwYm91cXVldCUyMGZsb3dlcnN8ZW58MXx8fHwxNzcwMDA5MDU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    popular: index === 1,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1765350226723-a96ab0705403?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd2VkZGluZyUyMGNvdXBsZSUyMG91dGRvb3J8ZW58MXx8fHwxNzcwMDU1NTMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Wedding couple"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
        </div>

        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">
              Your Love Story,
              <br />
              Beautifully Captured
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Elegant wedding photography and videography to treasure forever
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/packages"
                className="px-8 py-4 bg-white text-rose-600 rounded-full hover:shadow-xl transition-all font-medium"
              >
                View Packages
              </Link>
              <Link
                to="/bookings"
                search={{ packageId: undefined }}
                className="px-8 py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-xl transition-all font-medium"
              >
                Create Booking
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex p-4 bg-rose-50 rounded-full mb-4">
                <feature.icon className="size-8 text-rose-500" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Packages */}
      <section className="bg-gradient-to-b from-rose-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">Wedding Packages</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the perfect package for your special day
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {featuredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all ${
                  pkg.popular ? 'ring-2 ring-rose-400' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white px-4 py-1 rounded-full text-sm z-10">
                    Most Popular
                  </div>
                )}
                <div className="h-48 overflow-hidden">
                  <ImageWithFallback
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-serif text-gray-800 mb-2">{pkg.name}</h3>
                  <p className="text-3xl font-medium text-rose-500 mb-4">{pkg.price}</p>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="size-4 text-rose-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/packages/$packageId"
                    params={{ packageId: String(pkg.id) }}
                    className="w-full py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          {featuredPackages.length === 0 && (
            <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-md">
              <p className="text-gray-600">No published packages are available yet.</p>
              <Link
                to="/packages"
                className="mt-4 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 text-white"
              >
                Browse Packages
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">Happy Couples</h2>
          <p className="text-gray-600">What our clients say about us</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="size-12 rounded-full object-cover"
                />
                <p className="font-medium text-gray-800">{testimonial.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="bg-gradient-to-b from-white to-rose-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">Recent Work</h2>
            <p className="text-gray-600 mb-6">Browse our latest wedding photography</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => (
              <Link key={index} to="/gallery" className="block">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="aspect-square overflow-hidden rounded-lg cursor-pointer group"
                >
                  <ImageWithFallback
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all"
            >
              View Full Gallery
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
