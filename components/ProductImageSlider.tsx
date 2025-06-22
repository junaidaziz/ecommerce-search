import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { Image as ProductImage } from '../types/image';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

export interface ProductImageSliderProps {
  images?: ProductImage[];
  className?: string;
  imgClass?: string;
  placeholderSeed?: number;
  aspectRatioClass?: string;
}

export default function ProductImageSlider({
  images = [],
  className = '',
  imgClass = '',
  placeholderSeed = 1,
  aspectRatioClass = 'aspect-[4/5]',
}: ProductImageSliderProps) {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(false);
    };
    if (zoom) {
      document.addEventListener('keydown', handler);
    }
    return () => document.removeEventListener('keydown', handler);
  }, [zoom]);
  const urls = images.map((img) => (typeof img === 'string' ? img : img.url));
  const placeholderUrl = `https://picsum.photos/seed/${placeholderSeed}/400/400`;
  const [errorMap, setErrorMap] = useState<Record<number, boolean>>({});
  if (!urls || urls.length === 0) {
    return (
      <div className={`relative ${aspectRatioClass} ${className}`}>
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
    <div className={`relative ${aspectRatioClass} ${className}`}>
      <Image
        src={errorMap[idx] ? placeholderUrl : images[idx].url}
        alt={images[idx].alt || `Image ${idx + 1}`}
        fill
        className={`object-cover cursor-zoom-in ${imgClass}`}
        onClick={() => setZoom(true)}
        onError={() => setErrorMap((m) => ({ ...m, [idx]: true }))}
      />
      {urls.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {urls.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`w-2 h-2 rounded-full ${
                i === idx ? 'bg-primary' : 'bg-base-300'
              }`}
            />
          ))}
        </div>
      )}
      {zoom && (
        <dialog
          ref={dialogRef}
          open
          className="modal"
          onClick={(e) => {
            if (e.target === dialogRef.current) setZoom(false);
          }}
        >
          <div className="modal-box p-0 max-w-none relative">
            <button
              type="button"
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setZoom(false)}
            >
              ✖
            </button>
            <Image
              src={errorMap[idx] ? placeholderUrl : images[idx].url}
              alt={images[idx].alt || `Image ${idx + 1}`}
              width={800}
              height={800}
              className="w-full h-auto object-contain"
            />
            <form
              method="dialog"
              className="modal-backdrop"
              onClick={() => setZoom(false)}
            >
              <button>close</button>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}
