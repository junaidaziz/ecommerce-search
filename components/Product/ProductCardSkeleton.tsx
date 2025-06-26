const ProductCardSkeleton = () => (
  <div className="border border-base-300 rounded-xl p-2 animate-pulse flex flex-col gap-2">
    <div className="bg-base-300 h-32 rounded w-full" />
    <div className="h-4 bg-base-300 rounded w-3/4" />
    <div className="h-3 bg-base-300 rounded w-full" />
    <div className="h-4 bg-base-300 rounded w-1/2 mt-auto" />
  </div>
);

export default ProductCardSkeleton;
