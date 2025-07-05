import Image from 'next/image';
import type { FC } from 'react';

const cards = [
  {
    title: 'Summer Sale - Up to 50% Off',
    image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=600&q=80', // Watch
  },
  {
    title: 'New Arrivals Just Landed',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80', // Fashion
  },
  {
    title: 'Most Popular Items',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', // Camera
  },
];

const FeaturedCards: FC = () => (
  <section className="max-w-screen-xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
    {cards.map((card, idx) => (
      <div
        key={idx}
        className="relative rounded-2xl overflow-hidden shadow group h-64 flex items-end bg-gray-200"
      >
        <Image
          src={card.image}
          alt={card.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 p-6 w-full text-white text-xl font-semibold text-center">
          {card.title}
        </div>
      </div>
    ))}
  </section>
);

export default FeaturedCards; 