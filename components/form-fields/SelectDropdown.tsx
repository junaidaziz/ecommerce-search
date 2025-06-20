import React from 'react';
import Select from 'react-select';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectDropdownProps {
  label?: string;
  name: string;
  value?: SelectOption | SelectOption[] | null;
  onChange?: (option: SelectOption | SelectOption[] | null) => void;
  options: SelectOption[];
  placeholder?: string;
  isSearchable?: boolean;
  isDisabled?: boolean;
  isMulti?: boolean;
  error?: string;
  className?: string;
  icon?: React.ReactNode;
  [key: string]: unknown;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  isSearchable = true,
  isDisabled = false,
  isMulti = false,
  error,
  className = '',
  icon,
  ...rest
}) => {
  const inputId = rest.id || name;

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
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {icon}
          </span>
        )}
        <Select<SelectOption, boolean>
          inputId={inputId}
          name={name}
          value={value as SelectOption | SelectOption[] | null}
          onChange={(val) => onChange?.(val as SelectOption | SelectOption[] | null)}
          options={options}
          placeholder={placeholder}
          isSearchable={isSearchable}
          isDisabled={isDisabled}
          isMulti={isMulti}
          className={`w-full ${className}`}
          classNamePrefix="react-select"
          styles={
            icon
              ? { control: (base) => ({ ...base, paddingLeft: '2rem' }) }
              : undefined
          }
          {...rest}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default SelectDropdown;
