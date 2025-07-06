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
          className={`flex-1 px-3 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-base rounded-l-xl rounded-r-none shadow-sm ${error ? 'border-red-500' : ''} ${leftAddon ? 'rounded-l-none' : ''} ${className}`}
          {...registration}
          {...rest}
        />
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 rounded-r-xl rounded-l-none shadow-sm -ml-px"
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
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default PasswordInput;
