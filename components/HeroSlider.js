import { useState } from 'react';

/**
 * Sample hero slider using public domain Unsplash images.
 * Replace or remove these images before production launch.
 */
export default function HeroSlider() {
  const slides = [
    {
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
      alt: 'Modern tech gadgets on desk',
    },
    {
      url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1600&q=80',
      alt: 'Fashion accessories on table',
    },
    {
      url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80',
      alt: 'Lifestyle workspace with notebook',
    },
    {
      url: 'https://images.unsplash.com/photo-1556741533-f6acd6471b89?auto=format&fit=crop&w=1600&q=80',
      alt: 'Travel essentials and map',
    },
  ];

  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-64 mb-8 rounded-box overflow-hidden">
      <img
        src={slides[index].url}
        alt={slides[index].alt}
        className="object-cover w-full h-full"
      />
      <button
        type="button"
        onClick={prev}
        className="btn btn-circle absolute left-4 top-1/2 -translate-y-1/2"
        aria-label="Previous slide"
      >
        ❮
      </button>
      <button
        type="button"
        onClick={next}
        className="btn btn-circle absolute right-4 top-1/2 -translate-y-1/2"
        aria-label="Next slide"
      >
        ❯
      </button>
    </div>
  );
}
