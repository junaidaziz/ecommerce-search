import React, { useState } from 'react';
import Image from 'next/image';
import type { Image as ProductImage } from '@/types/image';

interface ImageGalleryProps {
  images?: ProductImage[];
  className?: string;
  imgClass?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images = [],
  className = '',
  imgClass = '',
}) => {
  const [idx, setIdx] = useState(0);
  const urls = images.length > 0 ? images.map((img) => img.url) : ['/placeholder.png'];

  const handleSelect = (i: number) => setIdx(i);

  return (
    <div className={className}>
      <div className="relative aspect-square md:aspect-[4/3] border rounded-box overflow-hidden">
        <Image
          src={urls[idx]}
          alt={images[idx]?.alt || `Image ${idx + 1}`}
          fill
          sizes="100vw"
          className={`object-cover ${imgClass}`}
        />
      </div>
      {urls.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {urls.map((u, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              className={`relative w-16 h-16 flex-shrink-0 border rounded-md overflow-hidden ${idx === i ? 'border-primary' : 'border-base-300'}`}
            >
              <Image src={u} alt={images[i]?.alt || `Thumbnail ${i + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
