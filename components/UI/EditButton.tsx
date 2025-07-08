import React from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

interface EditButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

const EditButton: React.FC<EditButtonProps> = ({ onClick, disabled, className = '', label = 'Edit', ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1 btn btn-sm bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 hover:text-blue-900 font-semibold rounded-lg shadow-sm transition px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...rest}
  >
    <PencilSquareIcon className="w-4 h-4" />
    {label}
  </button>
);

export default EditButton; 