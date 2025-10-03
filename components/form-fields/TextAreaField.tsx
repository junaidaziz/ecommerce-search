import React from 'react';
import { FieldValues, Path, UseFormRegister, RegisterOptions } from 'react-hook-form';

interface TextAreaFieldProps<T extends FieldValues>
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: Path<T>;
  label?: string;
  register?: UseFormRegister<T>;
  rules?: RegisterOptions<T, Path<T>>;
  error?: string;
  showLabel?: boolean;
  showRequiredIndicator?: boolean;
  wrapperClassName?: string;
}

export function TextAreaField<T extends FieldValues>(props: TextAreaFieldProps<T>) {
  const { name, label, register, rules, error, showLabel = true, showRequiredIndicator, wrapperClassName = '', className = '', ...rest } = props;
  const id = rest.id || name;
  const registration = register ? register(name, rules) : {};
  return (
    <div className={`mb-4 w-full ${wrapperClassName}`}>
      {label && showLabel && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {label}{' '}{(showRequiredIndicator || (rules && 'required' in rules)) && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 ${error ? 'border-red-500 dark:border-red-500' : ''} ${className}`}
        {...registration}
        {...rest}
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
}

export default TextAreaField;
