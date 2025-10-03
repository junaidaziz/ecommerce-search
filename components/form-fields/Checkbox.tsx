import React from 'react';
import {
  UseFormRegister,
  RegisterOptions,
  FieldValues,
  Path,
} from 'react-hook-form';

export interface CheckboxProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: Path<T>;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  register?: UseFormRegister<T>;
  rules?: RegisterOptions<T, Path<T>>;
}

const Checkbox = <T extends FieldValues>(props: CheckboxProps<T>) => {
  const {
    label,
    name,
    checked,
    onChange,
    onBlur,
    error,
    required = false,
    disabled = false,
    className = '',
    register,
    rules,
    ...rest
  } = props;
  const inputId = rest.id || name;
  const registration = register ? register(name, rules) : {};
  return (
    <div className={`mb-4 w-full ${disabled ? 'opacity-60' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex items-center h-11">
        <label htmlFor={inputId} className="cursor-pointer flex items-center gap-3">
          <input
            type="checkbox"
            id={inputId}
            name={name}
            checked={checked}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            className={`h-5 w-5 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 transition checked:bg-blue-600 checked:border-blue-600 dark:checked:bg-blue-600 dark:checked:border-blue-600 ${className}`}
            {...registration}
            {...rest}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Available for sale</span>
        </label>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
};

export default Checkbox;
