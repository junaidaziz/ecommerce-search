import React, { useEffect, useState } from 'react';
import Image from 'next/image';
// Listing version: single image only (slider reserved for detail page)

interface ProductImageProps {
  images: { url: string; alt?: string }[];
  className?: string;
  priority?: boolean;
}

const blurPlaceholder =
  'data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICQAAAAwAQCdASoEAAQAAsBMJaQAAuAAA/vvAAA=';

const ProductImage: React.FC<ProductImageProps> = ({ images, className = '', priority = false }) => {
  const first = images[0];
  const [src, setSrc] = useState(first?.url || '/placeholder.png');
  const alt = first?.alt || 'Product image';

  // Prefetch next (if any) after mount (can extend later)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (images.length > 1 && (globalThis as any).Image) {
      try {
        const Preloader: any = (globalThis as any).Image; // avoid TS dom lib dependency issues
        const pre = new Preloader();
        pre.src = images[1].url;
      } catch {
        // silent
      }
    }
  }, [images]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl mb-3 bg-gray-100 dark:bg-gray-800 flex items-center justify-center aspect-[4/3] ring-1 ring-gray-200/60 dark:ring-gray-700/60 group-hover:ring-primary/40 transition-colors ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width:768px) 50vw, (max-width:1200px) 25vw, 20vw"
        className="object-contain p-2 select-none transition-opacity duration-300"
        placeholder="blur"
        blurDataURL={blurPlaceholder}
        priority={priority}
        onError={() => setSrc('/placeholder.png')}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
};

export default ProductImage;
