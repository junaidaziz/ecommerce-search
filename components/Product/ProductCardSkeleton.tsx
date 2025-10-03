const ProductCardSkeleton = () => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 animate-pulse flex flex-col gap-3 bg-white dark:bg-gray-800">
    <div className="bg-gray-200 dark:bg-gray-700 h-40 rounded-xl w-full" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-auto" />
  </div>
);

export default ProductCardSkeleton;
