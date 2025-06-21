import React, { useState } from 'react';
import Image from 'next/image';
import type { Image as ProductImage } from '../types/image';

export interface ProductImageSliderProps {
  images?: ProductImage[];
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
  const urls = images.map((img) => (typeof img === 'string' ? img : img.url));
  const placeholderUrl = `https://picsum.photos/seed/${placeholderSeed}/400/400`;
  const [errorMap, setErrorMap] = useState<Record<number, boolean>>({});
  if (!urls || urls.length === 0) {
    return (
      <div className={`relative aspect-[4/5] ${className}`}>
        <Image
          src={placeholderUrl}
          alt="Placeholder product"
          fill
          className={`object-cover ${imgClass}`}
        />
      </div>
    );
  }
  return (
    <div className={`relative aspect-[4/5] ${className}`}>
      <Image
        src={errorMap[idx] ? placeholderUrl : images[idx].url}
        alt={images[idx].alt || `Image ${idx + 1}`}
        fill
        className={`object-cover ${imgClass}`}
        onError={() => setErrorMap((m) => ({ ...m, [idx]: true }))}
      />
      {urls.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {urls.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show image ${i + 1}`}
              className={`w-2 h-2 rounded-full border border-gray-400 ${
                i === idx ? 'bg-white' : 'bg-gray-300'
              }`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
