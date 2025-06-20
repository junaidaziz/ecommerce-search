import React from 'react';
import { UseFormFieldProps } from '../../types';

export interface FileUploadProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  field?: UseFormFieldProps;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  name,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  field,
  ...rest
}) => {
  const inputId = rest.id || field?.id || name;

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
        type="file"
        id={inputId}
        name={field?.name ?? name}
        onChange={field?.onChange ?? onChange}
        onBlur={field?.onBlur ?? onBlur}
        disabled={disabled}
        required={required}
        className={`w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${className}`}
        ref={field?.ref as any}
        {...rest}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default FileUpload;
