import React, { useEffect, useState } from 'react';
import type { Vendor } from '@/types';
import { Checkbox } from '../form-fields';
import BuildingIcon from '../icons/BuildingIcon';
import FilterSection from './FilterSection';

interface BrandFilterProps {
  selectedBrands: number[];
  setSelectedBrands: React.Dispatch<React.SetStateAction<number[]>>;
}

const BrandFilter: React.FC<BrandFilterProps> = ({ 
  selectedBrands, 
  setSelectedBrands 
}) => {
  const [brands, setBrands] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/vendors');
        if (res.ok) {
          const data = await res.json();
          setBrands(data.vendors || []);
        }
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  if (loading) {
    return (
      <FilterSection 
        label="Brands" 
        icon={<BuildingIcon className="w-4 h-4 text-purple-500" />}
      >
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading brands...</p>
        </div>
      </FilterSection>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <FilterSection 
      label="Brands" 
      icon={<BuildingIcon className="w-4 h-4 text-purple-500" />}
    >
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 max-h-64 overflow-y-auto">
        <div className="space-y-2">
          {brands.map((brand) => (
            <Checkbox
              key={brand.id}
              label={brand.brandName || 'Unknown Brand'}
              name={`brand-${brand.id}`}
              checked={selectedBrands.includes(brand.id)}
              onChange={(e) => {
                setSelectedBrands((prev) =>
                  e.target.checked
                    ? [...prev, brand.id]
                    : prev.filter((id) => id !== brand.id)
                );
              }}
              className="text-base font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary transition-colors duration-200 hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary dark:hover:border-primary rounded"
            />
          ))}
        </div>
      </div>
    </FilterSection>
  );
};

export default BrandFilter;
