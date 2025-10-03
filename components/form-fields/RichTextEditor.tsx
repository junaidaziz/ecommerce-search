import React from 'react';
import dynamic from 'next/dynamic';
import {
  Control,
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface RichTextEditorProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  error?: string;
  rules?: RegisterOptions<T, Path<T>>;
  required?: boolean;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const RichTextEditor = <T extends FieldValues>(props: RichTextEditorProps<T>) => {
  const { name, control, label, placeholder, error, rules, required = false } = props;
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <div className="mb-4 w-full">
          {label && (
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}
          <div style={{ height: '200px' }}>
            <ReactQuill
              theme="snow"
              value={field.value || ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={placeholder}
              modules={modules}
              style={{ height: '150px' }}
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
        </div>
      )}
    />
  );
};

export default RichTextEditor;
