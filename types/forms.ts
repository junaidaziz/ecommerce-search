export interface BaseFieldProps {
  label?: string;
  name: string;
  error?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface CheckboxFieldProps extends BaseFieldProps {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export interface SelectFieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectFieldProps extends BaseFieldProps {
  options: SelectFieldOption[];
  value?: SelectFieldOption | SelectFieldOption[] | null;
  onChange?: (option: SelectFieldOption | SelectFieldOption[] | null) => void;
  placeholder?: string;
  isSearchable?: boolean;
  isMulti?: boolean;
  icon?: React.ReactNode;
  noOptionsMessage?: string;
}

export interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  maxLength?: number;
}

export interface FileUploadFieldProps extends BaseFieldProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFileSelect?: (files: File[]) => void;
  preview?: boolean;
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
  disabled: false,
  isMulti: false,
  className: '',
};

export interface ProductFormValues {
  id?: number;
  vendorId: number;
  sku: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  categoryId: number;
  quantity: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  discountType: 'percentage' | 'fixed' | 'none';
  discountValue?: number;
  status: 'draft' | 'published' | 'archived';
  images?: string[];
}

export interface UserFormValues {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  brandName?: string;
  gender: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  businessAddress?: string;
  website?: string;
  businessDescription?: string;
  logo?: string;
  profileImage?: string;
  taxId?: string;
  stripeAccountId?: string;
}

export interface CategoryFormValues {
  name: string;
  slug?: string;
  description?: string;
}
