import React from 'react';
import {
  Control,
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import Select from 'react-select';
import Flag from 'react-world-flags';
import countries, { CountryInfo } from '../../data/countries';

interface CountrySelectProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  control: Control<T>;
  rules?: RegisterOptions<T, Path<T>>;
  error?: string;
  className?: string;
}

const formatOptionLabel = (option: CountryInfo) => (
  <div className="flex items-center gap-2">
    <Flag code={option.value} style={{ height: '1rem' }} />
    <span>
      {option.label} ({option.callingCode})
    </span>
  </div>
);

const CountrySelect = <T extends FieldValues>({
  name,
  label,
  control,
  rules,
  error,
  className = '',
}: CountrySelectProps<T>) => {
  const inputId = String(name);
  return (
    <div className="mb-4 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <Select
            inputId={inputId}
            {...field}
            options={countries}
            placeholder="Select country"
            isSearchable
            className={`w-full ${className}`}
            classNamePrefix="react-select"
            formatOptionLabel={formatOptionLabel}
          />
        )}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default CountrySelect;
