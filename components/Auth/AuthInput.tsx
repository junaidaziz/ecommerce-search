import React from 'react';
import { EmailInput, PasswordInput, TextInput } from '@components/form-fields';
import { UseFormRegister, FieldErrors, RegisterOptions } from 'react-hook-form';

interface AuthInputProps {
  type: 'email' | 'password' | 'text';
  name: string;
  placeholder: string;
  register: UseFormRegister<any>;
  rules?: RegisterOptions;
  error?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  required?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({
  type,
  name,
  placeholder,
  register,
  rules,
  error,
  onBlur,
  onFocus,
  required = false,
}) => {
  const baseClassName = `w-full text-base px-4 py-3 rounded-lg border ${
    error ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'
  } bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary`;

  const commonProps = {
    name,
    placeholder,
    register,
    rules,
    error: undefined, // Don't pass error to underlying component to prevent duplicates
    className: baseClassName,
  };

  return (
    <div>
      {type === 'email' && <EmailInput {...commonProps} onBlur={onBlur} />}
      {type === 'password' && <PasswordInput {...commonProps} onFocus={onFocus} />}
      {type === 'text' && <TextInput {...commonProps} />}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default AuthInput;
