import React from 'react';

interface PageHeroProps {
  heading: string;
  description?: string;
  className?: string;
}

const PageHero: React.FC<PageHeroProps> = ({ heading, description, className = '' }) => (
  <div className={`relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-green-800 ${className}`}>
    <div className="absolute inset-0 bg-black/10" />
    <div className="relative max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{heading}</h1>
        {description && (
          <p className="text-xl text-green-100 max-w-2xl mx-auto">{description}</p>
        )}
      </div>
    </div>
  </div>
);

export default PageHero; 