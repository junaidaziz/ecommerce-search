import React, { useEffect, useRef } from 'react';
import type { InfiniteLoaderProps } from '@/types';

const InfiniteLoader: React.FC<InfiniteLoaderProps> = ({
  onLoadMore,
  hasMore,
  loading,
  itemsLength = 0,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMore) {
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !triggeredRef.current) {
          triggeredRef.current = true;
          onLoadMore();
          // Reset the trigger after a short delay
          setTimeout(() => {
            triggeredRef.current = false;
          }, 1000);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loading, itemsLength]);

  return (
    <>
      <div className="flex justify-center my-4 h-8" aria-hidden={!loading}>
        {loading && <span className="loading loading-spinner" />}
      </div>
      {!hasMore && itemsLength > 0 && (
        <p className="text-center text-sm text-gray-500 my-4">
          No more products.
        </p>
      )}
      <div ref={ref} className="h-4" />
    </>
  );
};

export default InfiniteLoader;
