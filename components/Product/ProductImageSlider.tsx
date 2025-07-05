import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { Image as ProductImage } from '@/types';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';

export interface ProductImageSliderProps {
  images?: ProductImage[];
  className?: string;
  imgClass?: string;
  placeholderSeed?: number;
  aspectRatioClass?: string;
  showControls?: boolean;
}

export default function ProductImageSlider({
  images = [],
  className = '',
  imgClass = '',
  placeholderSeed = 1,
  aspectRatioClass = 'aspect-[4/5]',
  showControls = true,
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
          loading="lazy"
        />
      </div>
    );
  }
  
  const next = () => setIdx((idx + 1) % urls.length);
  const prev = () => setIdx((idx - 1 + urls.length) % urls.length);

  const handleModalClose = () => {
    console.log('Closing modal');
    setZoom(false);
  };

  return (
    <div className={`relative ${aspectRatioClass} ${className}`}>
      <Image
        src={errorMap[idx] ? placeholderUrl : images[idx].url}
        alt={images[idx].alt || `Image ${idx + 1}`}
        fill
        sizes="100vw"
        className={`object-cover cursor-zoom-in ${imgClass}`}
        onClick={() => {
          console.log('Opening modal');
          setZoom(true);
        }}
        onError={() => setErrorMap((m) => ({ ...m, [idx]: true }))}
        loading="lazy"
      />
      {showControls && urls.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-base-100/70 rounded-full p-1 hover:bg-base-100 transition-colors"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-base-100/70 rounded-full p-1 hover:bg-base-100 transition-colors"
          >
            <ChevronRightIcon />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {urls.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
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
          className="modal modal-open"
          onClick={(e) => {
            if (e.target === dialogRef.current) handleModalClose();
          }}
        >
          <div className="modal-box p-0 max-w-4xl w-full relative bg-transparent shadow-none">
            <div className="relative bg-base-100 rounded-lg overflow-hidden shadow-2xl">
              <button
                type="button"
                className="btn btn-circle btn-sm absolute right-4 top-4 z-10 bg-base-200/80 hover:bg-base-200 text-base-content border-0"
                onClick={handleModalClose}
                aria-label="Close modal"
              >
                ✕
              </button>
              <div className="relative w-full flex items-center justify-center min-h-[60vh] p-4">
                <Image
                  src={errorMap[idx] ? placeholderUrl : images[idx].url}
                  alt={images[idx].alt || `Image ${idx + 1}`}
                  width={800}
                  height={800}
                  className="w-full h-auto object-contain max-h-[80vh]"
                  loading="lazy"
                />
                {urls.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-base-200/80 hover:bg-base-200 rounded-full p-2 transition-colors border-0"
                      aria-label="Previous image"
                    >
                      <ChevronLeftIcon />
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-base-200/80 hover:bg-base-200 rounded-full p-2 transition-colors border-0"
                      aria-label="Next image"
                    >
                      <ChevronRightIcon />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {urls.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setIdx(i)}
                          className={`w-3 h-3 rounded-full transition-colors border-0 ${
                            i === idx ? 'bg-primary' : 'bg-base-300'
                          }`}
                          aria-label={`Go to image ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={handleModalClose}>
              <button type="button">close</button>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}
