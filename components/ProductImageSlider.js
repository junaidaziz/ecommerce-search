import { useState } from 'react';

export default function ProductImageSlider({
  images = [],
  className = '',
  imgClass = '',
}) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) {
    // Placeholder photo from Unsplash, replace before production
    return (
      <img
        src="https://images.unsplash.com/photo-1606813909275-63941d602ae2?auto=format&fit=crop&w=600&q=80"
        alt="Placeholder product"
        className={imgClass}
      />
    );
  }
  const next = () => setIdx((i) => (i + 1) % images.length);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  return (
    <div className={`relative ${className}`}>
      <img
        src={images[idx]}
        alt={`Image ${idx + 1}`}
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
