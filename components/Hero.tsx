import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1600&q=80',
    headline: 'Elevate Your Lifestyle',
    description: 'Discover a curated collection of products designed to enhance your everyday life. Quality, style, and innovation in one place.',
  },
  {
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80',
    headline: 'Shop the Latest Trends',
    description: 'Stay ahead with the newest arrivals and exclusive offers. Find your perfect style today.',
  },
  {
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1600&q=80',
    headline: 'Innovation Meets Style',
    description: 'Upgrade your essentials with products that blend technology and design for modern living.',
  },
];

const Hero: FC = () => (
  <section className="relative w-full rounded-3xl overflow-hidden mb-10 shadow-lg">
    <style jsx global>{`
      .swiper-button-next, .swiper-button-prev {
        @apply !bg-white/80 !text-orange-500 !rounded-full !shadow-lg !w-14 !h-14 !flex !items-center !justify-center !top-1/2 !-translate-y-1/2 !z-20;
        font-size: 2rem;
        border: none;
        transition: background 0.2s, color 0.2s;
      }
      .swiper-button-next:hover, .swiper-button-prev:hover {
        @apply !bg-orange-100 !text-orange-600;
      }
      .swiper-button-next:after, .swiper-button-prev:after {
        font-size: 2rem !important;
      }
    `}</style>
    <Swiper
      modules={[Autoplay, Pagination, EffectFade, Navigation]}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      navigation
      effect="fade"
      loop
      className="h-[420px] md:h-[520px]"
    >
      {slides.map((slide, i) => (
        <SwiperSlide key={i} className="relative w-full h-full">
          <Image
            src={slide.image}
            alt={slide.headline}
            fill
            sizes="100vw"
            className="object-cover"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-2xl mx-auto md:ml-16 bg-white/70 rounded-2xl p-8 md:p-12 shadow-lg backdrop-blur-sm">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight drop-shadow-lg">{slide.headline}</h1>
              <p className="text-lg text-gray-700 mb-8 max-w-lg">{slide.description}</p>
              <div className="flex gap-4">
                <Link href="/products" className="btn btn-primary px-6 py-2 rounded-full shadow">Explore Collection</Link>
                <Link href="/products?sort=best-sellers" className="btn btn-outline px-6 py-2 rounded-full shadow">Best Sellers</Link>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);

export default Hero;
