import React, { useState } from 'react';
import EyeIcon from '../icons/EyeIcon';
import EyeOffIcon from '../icons/EyeOffIcon';
import {
  UseFormRegister,
  RegisterOptions,
  FieldValues,
  Path,
} from 'react-hook-form';

export interface PasswordInputProps<T extends FieldValues>
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
  register?: UseFormRegister<T>;
  rules?: RegisterOptions<T, Path<T>>;
}

const PasswordInput = <T extends FieldValues>(props: PasswordInputProps<T>) => {
  const {
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
    register,
    rules,
    ...rest
  } = props;
  const [show, setShow] = useState(false);
  const inputId = rest.id || name;
  const registration = register ? register(name, rules) : {};
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
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${leftAddon ? 'rounded-l-none' : ''} rounded-r-none ${className}`}
          {...registration}
          {...rest}
        />
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center px-3 border border-l-0 rounded-r-md bg-gray-100 hover:bg-gray-200 focus:outline-none"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? (
            <EyeOffIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default PasswordInput;
