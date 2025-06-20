export interface UseFormFieldProps {
  name?: string;
  value?: any;
  checked?: boolean;
  onChange?: (...args: any[]) => void;
  onBlur?: (...args: any[]) => void;
  id?: string;
  ref?: React.Ref<any>;
}
