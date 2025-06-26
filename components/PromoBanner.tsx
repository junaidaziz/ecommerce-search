import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';

const banners = [
  {
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    text: 'Summer Sale - Up to 50% Off',
    href: '/products',
  },
  {
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
    text: 'New Arrivals Just Landed',
    href: '/products?sort=newest',
  },
  {
    image:
      'https://images.unsplash.com/photo-1495121605193-b116b5b09c63?auto=format&fit=crop&w=900&q=80',
    text: 'Most Popular Items',
    href: '/products?sort=popularity',
  },
];

const PromoBanner: FC = () => (
  <section className="py-8 bg-base-200">
    <div className="max-w-screen-2xl mx-auto px-4 grid gap-4 md:grid-cols-3">
      {banners.map((b, i) => (
        <Link
          key={i}
          href={b.href}
          className="relative block rounded-lg overflow-hidden group"
        >
          <Image
            src={b.image}
            alt=""
            width={600}
            height={200}
            className="object-cover w-full h-40 md:h-48 group-hover:scale-105 transition-transform"
          />
          <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-lg">
            {b.text}
          </span>
        </Link>
      ))}
    </div>
  </section>
);

export default PromoBanner;
