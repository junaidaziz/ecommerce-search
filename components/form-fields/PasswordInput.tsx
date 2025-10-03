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
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={`relative flex items-stretch w-full group border rounded-md bg-white dark:bg-gray-800 ${
          error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
        } focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-shadow`}
      >
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
          className={`flex-1 px-3 h-12 bg-transparent text-base rounded-l-md rounded-r-none shadow-none text-gray-900 dark:text-gray-100 outline-none border-none ${leftAddon ? 'rounded-l-none' : ''} ${className}`}
          {...registration}
          {...rest}
        />
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center justify-center w-12 h-12 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200 rounded-r-md rounded-l-none -ml-px"
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={0}
          style={{ border: 'none' }}
        >
          {show ? (
            <EyeOffIcon className="h-6 w-6 text-green-600" />
          ) : (
            <EyeIcon className="h-6 w-6 text-green-600" />
          )}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
};

export default PasswordInput;
