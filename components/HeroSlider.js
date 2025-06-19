import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import {
  Navigation,
  Pagination,
  Autoplay,
  A11y,
  EffectFade,
} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    image:
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1350&q=80',
    headline: 'Discover New Arrivals',
    tagline: 'Fresh styles just landed',
    href: '/products',
  },
  {
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1350&q=80',
    headline: 'Upgrade Your Tech',
    tagline: 'Latest gadgets at great prices',
    href: '/products?type=Electronics',
  },
  {
    image:
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1350&q=80',
    headline: 'Step Up Your Style',
    tagline: 'Trendy fashion for everyone',
    href: '/products?type=Fashion',
  },
];

export default function HeroSlider() {
  return (
    <section className="w-full" role="banner">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y, EffectFade]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        effect="fade"
        loop
        className="h-[60vh] md:h-[70vh]"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i} className="relative">
            <Image
              src={slide.image}
              alt=""
              fill
              className="object-cover"
            />
            <div className="relative z-10 flex flex-col items-center justify-center h-full bg-black/40 text-center text-white px-4">
              <h2 className="text-4xl md:text-6xl font-extrabold mb-2">
                {slide.headline}
              </h2>
              <p className="mb-6 text-lg md:text-2xl font-semibold">
                {slide.tagline}
              </p>
              <a href={slide.href} className="btn btn-primary btn-lg">
                Shop Now
              </a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
