import { Carousel } from 'antd';
import { useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { CloudinaryImage } from './CloudinaryImage';

type CarouselHandle = {
  goTo: (slide: number, dontAnimate?: boolean) => void;
  next: () => void;
  prev: () => void;
};

export interface ProductGalleryImage {
  id: string;
  src: string;
  alt: string;
}

interface ProductImageGalleryProps {
  images: ProductGalleryImage[];
  name: string;
}

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const carouselRef = useRef<CarouselHandle | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="rounded-[28px] border border-rose-100 bg-white p-8 text-center text-gray-500 shadow-sm">
        No images available for {name}.
      </div>
    );
  }

  const goToSlide = (index: number) => {
    carouselRef.current?.goTo(index);
    setCurrentIndex(index);
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-[28px] border border-rose-100 bg-gradient-to-br from-white via-rose-50/70 to-stone-100 shadow-[0_24px_80px_-32px_rgba(244,114,182,0.45)]">
        <button
          type="button"
          aria-label="Previous image"
          onClick={() => carouselRef.current?.prev()}
          className="absolute left-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/85 text-gray-700 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white"
        >
          <FiChevronLeft className="size-5" />
        </button>

        <button
          type="button"
          aria-label="Next image"
          onClick={() => carouselRef.current?.next()}
          className="absolute right-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/85 text-gray-700 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white"
        >
          <FiChevronRight className="size-5" />
        </button>

        <div className="absolute bottom-4 right-4 z-10 rounded-full bg-gray-950/72 px-3 py-1 text-sm font-medium text-white backdrop-blur">
          {currentIndex + 1} / {images.length}
        </div>

        <Carousel
          ref={(instance) => {
            carouselRef.current = instance as CarouselHandle | null;
          }}
          dots={false}
          infinite={images.length > 1}
          afterChange={setCurrentIndex}
        >
          {images.map((image) => (
            <div key={image.id}>
              <div className="aspect-[4/3] p-4 sm:p-6">
                <div className="flex h-full items-center justify-center overflow-hidden rounded-[22px] bg-white/80">
                  <CloudinaryImage
                    src={image.src}
                    alt={image.alt}
                    cloudinaryCropMode="fit"
                    styles={{
                      root: { width: '100%', height: '100%' },
                      image: { width: '100%', height: '100%', objectFit: 'contain' },
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => {
          const isActive = currentIndex === index;

          return (
            <button
              key={image.id}
              type="button"
              aria-label={`View image ${index + 1}`}
              onClick={() => goToSlide(index)}
              className={
                `relative h-20 w-20 flex-none overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ` +
                (isActive
                  ? 'border-rose-400 ring-2 ring-rose-200 shadow-md'
                  : 'border-rose-100 hover:border-rose-200 hover:shadow')
              }
            >
              <CloudinaryImage
                src={image.src}
                alt={image.alt}
                preview={false}
                cloudinaryCropMode="fill"
                styles={{
                  root: { width: '100%', height: '100%' },
                  image: { width: '100%', height: '100%', objectFit: 'cover' },
                }}
              />
              {isActive && (
                <span className="absolute inset-x-3 bottom-2 h-1 rounded-full bg-gradient-to-r from-rose-400 to-pink-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
