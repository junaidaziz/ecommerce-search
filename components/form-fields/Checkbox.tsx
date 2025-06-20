import React from 'react';

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  name,
  checked,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  ...rest
}) => {
  const inputId = rest.id || name;
  return (
    <div className="mb-4 w-full">
      <div className="flex items-center">
        <input
          type="checkbox"
          id={inputId}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`mr-2 border rounded text-blue-600 focus:ring-blue-500 ${className}`}
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
