import React, { useState } from 'react';
import Image from 'next/image';

export interface ProductImageSliderProps {
  images?: Array<string | { url: string }>;
  className?: string;
  imgClass?: string;
  placeholderSeed?: number;
}

export default function ProductImageSlider({
  images = [],
  className = '',
  imgClass = '',
  placeholderSeed = 1,
}: ProductImageSliderProps) {
  const [idx, setIdx] = useState(0);
  const urls = images.map((img) =>
    typeof img === 'string' ? img : img.url
  );
  if (!urls || urls.length === 0) {
    return (
      <div className={`relative aspect-[4/5] ${className}`}>
        <Image
          src={`https://source.unsplash.com/400x400/?product&sig=${placeholderSeed}`}
          alt="Placeholder product"
          fill
          className={`object-cover ${imgClass}`}
        />
      </div>
    );
  }
  const next = () => setIdx((i) => (i + 1) % urls.length);
  const prev = () => setIdx((i) => (i - 1 + urls.length) % urls.length);
  return (
    <div className={`relative aspect-[4/5] ${className}`}>
      <Image
        src={urls[idx]}
        alt={`Image ${idx + 1}`}
        fill
        className={`object-cover ${imgClass}`}
      />
      {urls.length > 1 && (
        <>
          <button
            type="button"
            className="btn btn-xs absolute left-1 top-1/2 -translate-y-1/2"
            onClick={prev}
          >
            Prev
          </button>
          <button
            type="button"
            className="btn btn-xs absolute right-1 top-1/2 -translate-y-1/2"
            onClick={next}
          >
            Next
          </button>
        </>
      )}
    </div>
  );
}
