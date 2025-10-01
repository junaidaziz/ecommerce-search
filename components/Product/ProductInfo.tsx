import React from 'react';
import Link from 'next/link';

interface ProductInfoProps {
  slug: string;
  title: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ slug, title }) => {
  return (
    <Link
      href={`/product/${slug}`}
      className="transition-colors duration-200"
    >
      <h3
        className="font-semibold text-base md:text-lg text-gray-900 dark:text-white line-clamp-2 leading-snug"
        title={title}
      >
        {title}
      </h3>
    </Link>
  );
};

export default ProductInfo;
