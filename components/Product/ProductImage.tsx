import React from 'react';
import ProductImageSlider from './ProductImageSlider';

interface ProductImageProps {
  images: { url: string; alt?: string }[];
  className?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ images, className = '' }) => {
  return (
    <div className={`relative overflow-hidden rounded-lg mb-3 bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${className}`}>
      <ProductImageSlider
        images={images}
        className="w-full aspect-[4/3] group-hover:scale-105 transition-transform duration-300"
        imgClass="object-contain"
        aspectRatioClass="aspect-[4/3]"
        showControls={false}
      />
    </div>
  );
};

export default ProductImage;
