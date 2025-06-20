import React from 'react';
import { UseFormFieldProps } from '../../types';

export interface RadioOption {
  label: string;
  value: string;
}

export interface RadioGroupProps {
  label?: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  options: RadioOption[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  field?: UseFormFieldProps;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  required = false,
  disabled = false,
  className = '',
  field,
}) => {
  const groupName = name;

  return (
    <div className={`mb-4 w-full ${className}`}>
      {label && (
        <p className="block text-sm font-medium text-gray-700 mb-1">{label}</p>
      )}
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center">
            <input
              type="radio"
              name={field?.name ?? groupName}
              value={opt.value}
              checked={(field?.value ?? value) === opt.value}
              onChange={field?.onChange ?? onChange}
              onBlur={field?.onBlur ?? onBlur}
              disabled={disabled}
              required={required}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default RadioGroup;
