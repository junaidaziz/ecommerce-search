import React, { useState } from 'react';
import {
  Controller,
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';

export interface TagInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  rules?: RegisterOptions<T, Path<T>>;
}

const TagInput = <T extends FieldValues>(props: TagInputProps<T>) => {
  const { name, control, label, placeholder = '', disabled, error, rules } = props;
  const [input, setInput] = useState('');
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => {
        const tags: string[] = field.value || [];
        const addTag = () => {
          const val = input.trim();
          if (!val) return;
          if (!tags.includes(val)) field.onChange([...tags, val]);
          setInput('');
        };
        return (
          <div className="mb-4 w-full">
            {label && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
            )}
            <div className="flex flex-wrap gap-1 mb-1">
              {tags.map((tag, idx) => (
                <span key={idx} className="badge badge-outline gap-1">
                  {tag}
                  <button
                    type="button"
                    className="ml-1"
                    onClick={() => field.onChange(tags.filter((_, i) => i !== idx))}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
              className={`px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        );
      }}
    />
  );
};

export default TagInput;
