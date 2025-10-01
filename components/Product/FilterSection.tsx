import React from 'react';

interface FilterSectionProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noBorder?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({ 
  label, 
  icon, 
  children, 
  className = '',
  noBorder = false 
}) => {
  return (
    <div className={`space-y-3 ${noBorder ? '' : 'py-3 border-b border-gray-200 dark:border-gray-700'} ${className}`}>
      <label className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
};

export default FilterSection;
