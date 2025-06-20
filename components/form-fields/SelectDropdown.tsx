import React from 'react';
import { Control, Controller, RegisterOptions } from 'react-hook-form';
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
  components?: any;
  control?: Control<any>;
  rules?: RegisterOptions;
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
  components: selectComponents,
  control,
  rules,
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
        {control ? (
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => (
              <Select<SelectOption, boolean>
                inputId={inputId}
                {...field}
                value={field.value as any}
                onChange={(val) => field.onChange(val)}
                onBlur={field.onBlur}
                options={options}
                placeholder={placeholder}
                isSearchable={isSearchable}
                isDisabled={isDisabled}
                isMulti={isMulti}
                components={selectComponents}
                className={`w-full ${className}`}
                classNamePrefix="react-select"
                styles={
                  icon
                    ? { control: (base) => ({ ...base, paddingLeft: '2rem' }) }
                    : undefined
                }
                {...rest}
              />
            )}
          />
        ) : (
          <Select<SelectOption, boolean>
            inputId={inputId}
            name={name}
            value={value as any}
            onChange={(val) => onChange?.(val)}
            options={options}
            placeholder={placeholder}
            isSearchable={isSearchable}
            isDisabled={isDisabled}
            isMulti={isMulti}
            components={selectComponents}
            className={`w-full ${className}`}
            classNamePrefix="react-select"
            styles={
              icon
                ? { control: (base) => ({ ...base, paddingLeft: '2rem' }) }
                : undefined
            }
            {...rest}
          />
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default SelectDropdown;
