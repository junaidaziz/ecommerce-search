import React from 'react';
import {
  Control,
  Controller,
  RegisterOptions,
  FieldValues,
  Path,
} from 'react-hook-form';
import AsyncCreatableSelect from 'react-select/async-creatable';

export interface AsyncSelectOption {
  label: string;
  value: string | number;
}

export interface AsyncSelectDropdownProps<T extends FieldValues> {
  label?: string;
  name: Path<T>;
  value?: AsyncSelectOption | AsyncSelectOption[] | null;
  onChange?: (option: AsyncSelectOption | AsyncSelectOption[] | null) => void;
  loadOptions: (inputValue: string) => Promise<AsyncSelectOption[]>;
  onCreateOption?: (value: string) => void;
  placeholder?: string;
  isMulti?: boolean;
  error?: string;
  className?: string;
  control?: Control<T>;
  rules?: RegisterOptions<T, Path<T>>;
}

const AsyncSelectDropdown = <T extends FieldValues>(
  props: AsyncSelectDropdownProps<T>
) => {
  const {
    label,
    name,
    value,
    onChange,
    loadOptions,
    onCreateOption,
    placeholder,
    isMulti = false,
    error,
    className = '',
    control,
    rules,
    ...rest
  } = props;
  const inputId: string = typeof rest.id === 'string' ? rest.id : String(name);

  const SelectComponent = (
    <AsyncCreatableSelect
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      onCreateOption={onCreateOption}
      isMulti={isMulti}
      inputId={inputId}
      value={value as any}
      onChange={(val) => {
        if (Array.isArray(val)) {
          onChange?.([...val] as any);
        } else if (val === null) {
          onChange?.(null);
        } else {
          onChange?.(val as any);
        }
      }}
      placeholder={placeholder}
      className={`w-full ${className}`}
      classNamePrefix="react-select"
      {...rest}
    />
  );

  return (
    <div className="mb-4 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {control ? (
        <Controller name={name} control={control} rules={rules} render={({ field }) => React.cloneElement(SelectComponent, { ...field })} />
      ) : (
        SelectComponent
      )}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default AsyncSelectDropdown;
