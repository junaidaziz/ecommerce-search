import React from 'react';
import {
  Controller,
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import AsyncCreatableSelect from 'react-select/async-creatable';

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
  const {
    name,
    control,
    label,
    placeholder = '',
    disabled,
    error,
    rules,
  } = props;

  const loadOptions = async (inputValue: string) => {
    const params = new URLSearchParams({ search: inputValue });
    const res = await fetch(`/api/tags?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.tags || []).map((t: string) => ({ label: t, value: t }));
  };


  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => {
        const tags: string[] = field.value || [];
        const removeTag = (tag: string) => {
          field.onChange(tags.filter((t) => t !== tag));
        };
        return (
          <div className="mb-4 w-full">
            {label && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 max-h-24 overflow-y-auto">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm"
                    title={tag}
                  >
                    <span className="truncate max-w-[10rem]">{tag}</span>
                    <button
                      type="button"
                      className="ml-1"
                      onClick={() => removeTag(tag)}
                      aria-label="Remove tag"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            <AsyncCreatableSelect
              isMulti
              inputId={`tag-input-${String(name)}`}
              value={tags.map((t) => ({ label: t, value: t }))}
              defaultOptions
              loadOptions={loadOptions}
              onChange={(val) => {
                const arr = Array.isArray(val) ? val.map((v) => v.value) : [];
                field.onChange(arr);
              }}
              onCreateOption={(val) => {
                const newTag = val.trim();
                if (newTag && !tags.includes(newTag)) {
                  field.onChange([...tags, newTag]);
                }
              }}
              onBlur={field.onBlur}
              placeholder={placeholder}
              isDisabled={disabled}
              className="w-full"
              classNamePrefix="react-select"
              components={{ MultiValue: () => null }}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        );
      }}
    />
  );
};

export default TagInput;
