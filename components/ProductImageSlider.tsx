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
          sizes="100vw"
          className={`object-cover ${imgClass}`}
        />
      </div>
    );
  }
  const next = () => setIdx((idx + 1) % urls.length);
  const prev = () => setIdx((idx - 1 + urls.length) % urls.length);

  return (
    <div className={`relative ${aspectRatioClass} ${className}`}>
      <Image
        src={errorMap[idx] ? placeholderUrl : images[idx].url}
        alt={images[idx].alt || `Image ${idx + 1}`}
        fill
        sizes="100vw"
        className={`object-cover cursor-zoom-in ${imgClass}`}
        onClick={() => setZoom(true)}
        onError={() => setErrorMap((m) => ({ ...m, [idx]: true }))}
      />
      {urls.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-base-100/70 rounded-full p-1"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-base-100/70 rounded-full p-1"
          >
            <ChevronRightIcon />
          </button>
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
        </>
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
            <div className="relative w-full flex items-center justify-center">
              <Image
                src={errorMap[idx] ? placeholderUrl : images[idx].url}
                alt={images[idx].alt || `Image ${idx + 1}`}
                width={800}
                height={800}
                className="w-full h-auto object-contain max-h-[80vh]"
              />
              {urls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-base-100/70 rounded-full p-1"
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-base-100/70 rounded-full p-1"
                  >
                    <ChevronRightIcon />
                  </button>
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
                </>
              )}
            </div>
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
