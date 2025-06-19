import { useState } from 'react';

export default function ProductImageSlider({ images = [], className = '', imgClass = '' }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) {
    return (
      <img
        src="https://placehold.co/600x400?text=No+Image"
        alt="No image"
        className={imgClass}
      />
    );
  }
  const next = () => setIdx((i) => (i + 1) % images.length);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  return (
    <div className={`relative ${className}`}>
      <img src={images[idx]} alt={`Image ${idx + 1}`} className={`object-cover ${imgClass}`} />
      {images.length > 1 && (
        <>
          <button type="button" className="btn btn-xs absolute left-1 top-1/2 -translate-y-1/2" onClick={prev}>
            Prev
          </button>
          <button type="button" className="btn btn-xs absolute right-1 top-1/2 -translate-y-1/2" onClick={next}>
            Next
          </button>
        </>
      )}
    </div>
  );
}
