import React from 'react';

export interface DatePickerProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  name,
  value,
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
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="date"
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...rest}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default DatePicker;
