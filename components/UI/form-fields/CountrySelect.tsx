import React from 'react';
import {
  Control,
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import Select from 'react-select';
import Flag from 'react-world-flags';
import countries, { CountryInfo } from '../../data/countries';

type FormProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T, Path<T>>;
};

type StandaloneProps = {
  value: string;
  onChange: (value: string) => void;
};

export interface CountrySelectBase {
  label?: string;
  error?: string;
  className?: string;
}

type CountrySelectProps<T extends FieldValues> =
  | (CountrySelectBase & FormProps<T>)
  | (CountrySelectBase & StandaloneProps);

const formatOptionLabel = (option: CountryInfo) => (
  <div className="flex items-center gap-2">
    <Flag code={option.value} style={{ height: '1rem' }} />
    <span>
      {option.label} ({option.callingCode})
    </span>
  </div>
);

const CountrySelect = <T extends FieldValues>(props: CountrySelectProps<T>) => {
  const { label, error, className = '' } = props;
  const inputId =
    'name' in props && props.name ? String(props.name) : 'country-select';

  const select = (fieldProps: any) => (
    <Select
      inputId={inputId}
      {...fieldProps}
      options={countries}
      placeholder="Select country"
      isSearchable
      className={`w-full ${className}`}
      classNamePrefix="react-select"
      formatOptionLabel={formatOptionLabel}
    />
  );

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
      {'control' in props ? (
        <Controller
          name={props.name}
          control={props.control}
          rules={props.rules}
          render={({ field }) => select(field)}
        />
      ) : (
        select({
          value: countries.find((c) => c.value === props.value),
          onChange: (option: CountryInfo | null) =>
            props.onChange(option ? option.value : ''),
        })
      )}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default CountrySelect;
