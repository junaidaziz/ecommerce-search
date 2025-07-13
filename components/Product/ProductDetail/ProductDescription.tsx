import React from 'react';

interface ProductDescriptionProps {
  description?: string;
  bodyHtmlText?: string;
  descriptionText?: string;
  className?: string;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  bodyHtmlText,
  descriptionText,
  className = '',
}) => {
  return (
    <div className={`bg-base-100 rounded-2xl shadow-lg p-8 ${className}`}>
      <h2 className="text-2xl font-bold mb-6">Product Description</h2>
      <div
        className="prose prose-lg max-w-none text-base text-gray-300 dark:text-gray-300"
        dangerouslySetInnerHTML={{
          __html:
            description ||
            bodyHtmlText ||
            descriptionText ||
            '<span class="text-gray-400">No description available.</span>',
        }}
      />
    </div>
  );
};

export default ProductDescription; 