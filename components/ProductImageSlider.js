import { useState } from 'react';
import Image from 'next/image';

export default function ProductImageSlider({
  images = [],
  className = '',
  imgClass = '',
  placeholderSeed = 1,
}) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) {
    return (
      <Image
        src={`https://source.unsplash.com/400x400/?product&sig=${placeholderSeed}`}
        alt="Placeholder product"
        width={400}
        height={400}
        className={imgClass}
      />
    );
  }
  const next = () => setIdx((i) => (i + 1) % images.length);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  return (
    <div className={`relative ${className}`}>
      <Image
        src={images[idx]}
        alt={`Image ${idx + 1}`}
        width={400}
        height={400}
        className={`object-cover ${imgClass}`}
      />
      {images.length > 1 && (
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
