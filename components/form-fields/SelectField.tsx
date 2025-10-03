import React from 'react';
import { FieldValues, Path, UseFormRegister, RegisterOptions, Controller, Control } from 'react-hook-form';

export interface SelectFieldOption {
  label: string;
  value: string;
}

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  options: SelectFieldOption[];
  control?: Control<T>;
  register?: UseFormRegister<T>;
  rules?: RegisterOptions<T, Path<T>>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  showLabel?: boolean;
  showRequiredIndicator?: boolean;
  wrapperClassName?: string;
  className?: string;
}

const baseClasses = 'w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 border-gray-300 dark:border-gray-700';

export function SelectField<T extends FieldValues>(props: SelectFieldProps<T>) {
  const { name, label, options, control, register, rules, placeholder, disabled, error, showLabel = true, showRequiredIndicator, wrapperClassName = '', className = '' } = props;
  const id = name as string;

  const selectEl = (
    <select
      id={id}
      disabled={disabled}
      className={`${baseClasses} ${error ? 'border-red-500 dark:border-red-500' : ''} ${className}`}
      {...(register ? register(name, rules) : {})}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  return (
    <div className={`mb-4 w-full ${wrapperClassName}`}>      
      {label && showLabel && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {label}{' '}{(showRequiredIndicator || (rules && 'required' in rules)) && <span className="text-red-500">*</span>}
        </label>
      )}
      {control ? (
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field }) => React.cloneElement(selectEl, { ...field })}
        />
      ) : selectEl}
      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
}

export default SelectField;
