import React from 'react';
import {
  Control,
  Controller,
  RegisterOptions,
  FieldValues,
  Path,
} from 'react-hook-form';
import Select, { type Props as SelectProps, type NoticeProps } from 'react-select';
import type { components, StylesConfig, GroupBase } from 'react-select';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectDropdownProps<T extends FieldValues> {
  label?: string;
  name: Path<T>;
  value?: SelectOption | SelectOption[] | null;
  onChange?: (option: SelectOption | SelectOption[] | null) => void;
  options: SelectOption[];
  placeholder?: string;
  isSearchable?: boolean;
  isDisabled?: boolean;
  isMulti?: boolean;
  error?: string;
  className?: string;
  icon?: React.ReactNode;
  components?: Partial<typeof components>;
  styles?: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>>;
  control?: Control<T>;
  rules?: RegisterOptions<T, Path<T>>;
  onAddNew?: (inputValue: string) => void;
  addNewLabel?: string;
  [key: string]: unknown;
}

const SelectDropdown = <T extends FieldValues>(
  props: SelectDropdownProps<T>
) => {
  const {
    label,
    name,
    value,
    onChange,
    options,
    placeholder,
    isSearchable = true,
    isDisabled = false,
    isMulti = false,
    error,
    className = '',
    icon,
    components: selectComponents,
    control,
    rules,
    onAddNew,
    addNewLabel = 'Add',
    ...rest
  } = props;
  const inputId: string = typeof rest.id === 'string' ? rest.id : String(name);

  // Custom noOptionsMessage and menuList for add new
  const customComponents = {
    ...selectComponents,
    NoOptionsMessage: (noOptionsProps: NoticeProps<OptionType, false, GroupBase<OptionType>>) => (
      <div className="bg-gray-800 text-white rounded-lg shadow-lg p-0 overflow-hidden min-w-[220px]">
        <div className="px-4 py-3 text-gray-300 text-sm">No options found.</div>
        {onAddNew && noOptionsProps.selectProps.inputValue ? (
          <button
            type="button"
            className="flex items-center gap-2 w-full px-4 py-3 text-blue-400 hover:text-blue-200 hover:bg-gray-700 font-medium text-base transition text-left"
            onMouseDown={(e) => {
              e.preventDefault();
              onAddNew(noOptionsProps.selectProps.inputValue);
            }}
          >
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add new <span className="font-semibold">{noOptionsProps.selectProps.inputValue}</span>
          </button>
        ) : null}
      </div>
    ),
  };

  return (
    <div className="mb-4 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {icon}
          </span>
        )}
        {control ? (
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => (
              <Select<SelectOption, boolean>
                inputId={inputId}
                {...field}
                value={field.value as SelectOption | SelectOption[] | null}
                onChange={(val) => field.onChange(val)}
                onBlur={field.onBlur}
                options={options}
                placeholder={placeholder}
                isSearchable={isSearchable}
                isDisabled={isDisabled}
                isMulti={isMulti}
                components={customComponents}
                className={`w-full ${className}`}
                classNamePrefix="react-select"
                styles={
                  icon
                    ? { control: (base) => ({ ...base, paddingLeft: '2rem' }) }
                    : undefined
                }
                {...rest}
              />
            )}
          />
        ) : (
          <Select<SelectOption, boolean>
            inputId={inputId}
            name={name}
            value={value as SelectOption | SelectOption[] | null}
            onChange={(val) => {
              if (Array.isArray(val)) {
                // Cast readonly array to mutable array
                onChange?.([...val]);
              } else if (val === null) {
                onChange?.(null);
              } else {
                onChange?.(val as SelectOption);
              }
            }}
            options={options}
            placeholder={placeholder}
            isSearchable={isSearchable}
            isDisabled={isDisabled}
            isMulti={isMulti}
            components={customComponents}
            className={`w-full ${className}`}
            classNamePrefix="react-select"
            styles={
              icon
                ? { control: (base) => ({ ...base, paddingLeft: '2rem' }) }
                : undefined
            }
            {...rest}
          />
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default SelectDropdown;
