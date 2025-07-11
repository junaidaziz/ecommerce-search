import React from 'react';

interface PageHeroProps {
  heading: string;
  description?: string;
  className?: string;
}

const PageHero: React.FC<PageHeroProps> = ({ heading, description, className = '' }) => (
  <section
    className={`relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-green-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 md:py-16 w-full transition-colors duration-300 ${className}`}
  >
    <div className="absolute inset-0 bg-black/10 dark:bg-black/40 pointer-events-none transition-colors duration-300" />
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl md:text-5xl font-extrabold text-white dark:text-primary mb-4 drop-shadow-lg transition-colors duration-300">
        {heading}
      </h1>
      {description && (
        <p className="text-lg md:text-xl text-green-100 dark:text-gray-200 max-w-2xl mx-auto transition-colors duration-300">
          {description}
        </p>
      )}
    </div>
  </section>
);

export default PageHero; 