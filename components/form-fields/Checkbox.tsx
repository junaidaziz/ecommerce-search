import React from 'react';
import { UseFormRegister, RegisterOptions } from 'react-hook-form';

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  register?: UseFormRegister<any>;
  rules?: RegisterOptions;
}

const Checkbox: React.FC<CheckboxProps> = ({
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
}) => {
  const inputId = rest.id || name;
  const registration = register ? register(name, rules) : {};
  return (
    <div className="mb-4 w-full">
      <div className="flex items-center">
        <input
          type="checkbox"
          id={inputId}
          name={name}
          checked={checked}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`mr-2 border rounded text-blue-600 focus:ring-blue-500 ${className}`}
          {...registration}
          {...rest}
        />
        {label && (
          <label htmlFor={inputId} className="text-sm text-gray-700">
            {label}
          </label>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default Checkbox;
