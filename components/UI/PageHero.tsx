import React from 'react';

interface PageHeroProps {
  heading: string;
  description?: string;
  className?: string;
}

const PageHero: React.FC<PageHeroProps> = ({ heading, description, className = '' }) => (
  <section
    className={`relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-green-800 py-12 md:py-16 w-full ${className}`}
  >
    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
        {heading}
      </h1>
      {description && (
        <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  </section>
);

export default PageHero; 