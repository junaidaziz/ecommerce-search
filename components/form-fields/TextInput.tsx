import React from 'react';
import {
  UseFormRegister,
  RegisterOptions,
  FieldValues,
  Path,
} from 'react-hook-form';

export interface TextInputProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: Path<T>;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  register?: UseFormRegister<T>;
  rules?: RegisterOptions;
}

const TextInput = <T extends FieldValues>({
  label,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  leftAddon,
  rightAddon,
  register,
  rules,
  ...rest
}) => {
  const inputId = rest.id || name;
  const registration = register ? register(name, rules) : {};

  return (
    <div className="mb-4 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-stretch w-full">
        {leftAddon && (
          <span className="inline-flex items-center px-3 text-gray-500">
            {leftAddon}
          </span>
        )}
        <input
          type="text"
          id={inputId}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${leftAddon ? 'rounded-l-none' : ''} ${rightAddon ? 'rounded-r-none' : ''} ${className}`}
          {...registration}
          {...rest}
        />
        {rightAddon && (
          <span className="inline-flex items-center px-3 text-gray-500">
            {rightAddon}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default TextInput;
