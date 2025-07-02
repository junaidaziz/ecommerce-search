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
  const { name, control, label, placeholder, error, rules } = props;
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <div className="mb-4 w-full">
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
          )}
          <ReactQuill
            theme="snow"
            value={field.value || ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder={placeholder}
            modules={modules}
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
      )}
    />
  );
};

export default RichTextEditor;
