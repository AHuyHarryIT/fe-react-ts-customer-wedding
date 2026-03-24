import { useState } from 'react';
import { Download, X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface GalleryPageProps {
  onNavigate: (page: string) => void;
}

export function GalleryPage({ onNavigate }: GalleryPageProps) {
  void onNavigate;
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const images = [
    {
      url: 'https://images.unsplash.com/photo-1765350226723-a96ab0705403?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd2VkZGluZyUyMGNvdXBsZSUyMG91dGRvb3J8ZW58MXx8fHwxNzcwMDU1NTMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Portraits',
      status: 'available'
    },
    {
      url: 'https://images.unsplash.com/photo-1765615197770-a46baa12db63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjByb21hbnRpY3xlbnwxfHx8fDE3NzAxMDkxODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Ceremony',
      status: 'available'
    },
    {
      url: 'https://images.unsplash.com/photo-1692167900605-e02666cadb6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwYm91cXVldCUyMGZsb3dlcnN8ZW58MXx8fHwxNzcwMDA5MDU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Details',
      status: 'available'
    },
    {
      url: 'https://images.unsplash.com/photo-1720535594328-5e681403350a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcGhvdG9ncmFwaHklMjBzdHVkaW98ZW58MXx8fHwxNzcwMTA5MTgzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Reception',
      status: 'available'
    },
    {
      url: 'https://images.unsplash.com/photo-1622580627463-b03d48e305d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZSUyMGdyb29tJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcwMTA5MTgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Portraits',
      status: 'available'
    },
    {
      url: 'https://images.unsplash.com/photo-1677768062274-fdd45caac233?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwZGV0YWlsc3xlbnwxfHx8fDE3NzAxMDkxODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Details',
      status: 'available'
    }
  ];

  const handleImageSelect = (index: number) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedImages(newSelected);
  };

  const handleDownloadSelected = () => {
    alert(`Downloading ${selectedImages.size} images...`);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-gray-800 mb-2">
                Your Gallery
              </h1>
              <p className="text-gray-600">
                {images.length} photos available for download
              </p>
            </div>

            <div className="flex gap-3">
              {!selectionMode ? (
                <button
                  onClick={() => setSelectionMode(true)}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-full hover:border-rose-400 hover:text-rose-500 transition-all"
                >
                  Select Photos
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSelectionMode(false);
                      setSelectedImages(new Set());
                    }}
                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDownloadSelected}
                    disabled={selectedImages.size === 0}
                    className="px-6 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Download className="size-4" />
                    Download ({selectedImages.size})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Status Info */}
          <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="size-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Gallery Ready</p>
              <p className="text-sm text-green-700">
                All photos are available for viewing and download
              </p>
            </div>
          </div>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
              onClick={() => {
                if (selectionMode) {
                  handleImageSelect(index);
                } else {
                  setSelectedImage(index);
                }
              }}
            >
              <ImageWithFallback
                src={image.url}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-xs text-white bg-black/40 px-2 py-1 rounded">
                    {image.category}
                  </span>
                </div>
              </div>

              {/* Selection Checkbox */}
              {selectionMode && (
                <div className="absolute top-3 right-3 z-10">
                  <div
                    className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedImages.has(index)
                        ? 'bg-rose-500 border-rose-500'
                        : 'bg-white/80 border-white'
                    }`}
                  >
                    {selectedImages.has(index) && (
                      <CheckCircle className="size-4 text-white" />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
              onClick={() => setSelectedImage(null)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
                className="absolute top-4 right-4 size-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <X className="size-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 size-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="size-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 size-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="size-6" />
              </button>

              <div
                className="max-w-6xl max-h-[90vh] px-12"
                onClick={(e) => e.stopPropagation()}
              >
                <ImageWithFallback
                  src={images[selectedImage].url}
                  alt={`Gallery ${selectedImage + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-4 py-2 rounded-full">
                {selectedImage + 1} / {images.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
