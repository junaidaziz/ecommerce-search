import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

const images = [
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1600&q=80',
];

const HomeHero: React.FC = () => (
  <section className="relative bg-base-200 overflow-hidden">
    <div className="absolute inset-0 -z-10">
      <Swiper
        modules={[Autoplay, EffectFade]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        effect="fade"
        loop
        className="w-full h-full"
      >
        {images.map((src, i) => (
          <SwiperSlide key={i} className="relative w-full h-full">
            <Image
              src={src}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority={i === 0}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="absolute inset-0 bg-black/40" />
    </div>
    <div className="max-w-screen-xl mx-auto px-4 py-20 text-center relative z-10">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
        Shop the latest products
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Check out our newest arrivals and special offers.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/products" className="btn btn-primary">
          Shop Now
        </Link>
        <Link href="/about" className="btn btn-outline">
          Learn More
        </Link>
      </div>
    </div>
  </section>
);

export default HomeHero;
