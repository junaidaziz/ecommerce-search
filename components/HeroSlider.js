import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1350&q=80',
    headline: 'Discover New Arrivals',
    tagline: 'Fresh styles just landed',
    href: '/products',
  },
  {
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1350&q=80',
    headline: 'Upgrade Your Tech',
    tagline: 'Latest gadgets at great prices',
    href: '/products?type=Electronics',
  },
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1350&q=80',
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
            <img
              src={slide.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative z-10 flex flex-col items-center justify-center h-full bg-black/40 text-center text-white px-4">
              <h2 className="text-3xl md:text-5xl font-bold mb-2">{slide.headline}</h2>
              <p className="mb-4 md:text-lg">{slide.tagline}</p>
              <a href={slide.href} className="btn btn-primary">Shop Now</a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
