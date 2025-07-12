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
    <div className="mb-2 last:mb-0 w-full">
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
          className={`h-4 w-4 mr-2 text-primary border-gray-300 rounded focus:ring-primary dark:border-gray-600 ${className}`}
          {...registration}
          {...rest}
        />
        {label && (
          <label htmlFor={inputId} className="text-sm text-base-content">
            {label}
          </label>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default Checkbox;
