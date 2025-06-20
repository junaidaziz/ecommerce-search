import React, { useState } from 'react';
import { UseFormFieldProps } from '../../types';

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  leftAddon?: React.ReactNode;
  field?: UseFormFieldProps;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
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
  field,
  ...rest
}) => {
  const [show, setShow] = useState(false);
  const inputId = rest.id || field?.id || name;
  const toggle = () => setShow(!show);

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
          type={show ? 'text' : 'password'}
          id={inputId}
          name={field?.name ?? name}
          placeholder={placeholder}
          value={field?.value ?? value}
          onChange={field?.onChange ?? onChange}
          onBlur={field?.onBlur ?? onBlur}
          disabled={disabled}
          required={required}
          className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${leftAddon ? 'rounded-l-none' : ''} rounded-r-none ${className}`}
          ref={field?.ref as any}
          {...rest}
        />
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center px-3 border border-l-0 rounded-r-md bg-gray-100 hover:bg-gray-200"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default PasswordInput;
