export interface BaseFieldProps {
  label?: string;
  name: string;
  error?: string;
  className?: string;
}

export interface InputFieldProps extends BaseFieldProps {
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  hint?: string;
}

export interface CheckboxFieldProps extends BaseFieldProps {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
}

export interface SelectFieldOption {
  label: string;
  value: string;
}

export interface SelectFieldProps extends BaseFieldProps {
  options: SelectFieldOption[];
  value?: SelectFieldOption | SelectFieldOption[] | null;
  onChange?: (option: SelectFieldOption | SelectFieldOption[] | null) => void;
  placeholder?: string;
  isSearchable?: boolean;
  isDisabled?: boolean;
  isMulti?: boolean;
  icon?: React.ReactNode;
}

export const defaultInputFieldProps: Partial<InputFieldProps> = {
  type: 'text',
  disabled: false,
  required: false,
  className: '',
};

export const defaultCheckboxFieldProps: Partial<CheckboxFieldProps> = {
  checked: false,
  disabled: false,
  required: false,
  className: '',
};

export const defaultSelectFieldProps: Partial<SelectFieldProps> = {
  isSearchable: true,
  isDisabled: false,
  isMulti: false,
  className: '',
};
