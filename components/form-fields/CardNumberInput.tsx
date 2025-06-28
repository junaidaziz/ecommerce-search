import React, { useEffect, useState } from 'react';
import {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from 'react-hook-form';
import CreditCardIcon from '../icons/CreditCardIcon';
import VisaIcon from '../icons/VisaIcon';
import MastercardIcon from '../icons/MastercardIcon';
import AmexIcon from '../icons/AmexIcon';
import DiscoverIcon from '../icons/DiscoverIcon';
import {
  CardBrand,
  detectCardBrand,
  formatCardNumber,
} from '@utils/cardUtils';

export interface CardNumberInputProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: Path<T>;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  register?: UseFormRegister<T>;
  rules?: RegisterOptions<T, Path<T>>;
  onCardTypeChange?: (brand: CardBrand) => void;
}

type BrandMap = { [key in CardBrand]: React.FC<{ size?: number; className?: string }> };

const icons: BrandMap = {
  visa: VisaIcon,
  mastercard: MastercardIcon,
  amex: AmexIcon,
  discover: DiscoverIcon,
  unknown: CreditCardIcon,
};

const CardNumberInput = <T extends FieldValues>(props: CardNumberInputProps<T>) => {
  const {
    label,
    name,
    value: valueProp,
    onChange,
    onBlur,
    error,
    required = false,
    disabled = false,
    className = '',
    register,
    rules,
    onCardTypeChange,
    ...rest
  } = props;
  const inputId = rest.id || name;
  const registration = register ? register(name, rules) : {};
  const [value, setValue] = useState(valueProp || '');
  const [brand, setBrand] = useState<CardBrand>('unknown');

  useEffect(() => {
    setValue(valueProp || '');
    setBrand(detectCardBrand(valueProp || ''));
  }, [valueProp]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    const formatted = formatCardNumber(digits);
    setValue(formatted);
    const b = detectCardBrand(digits);
    setBrand(b);
    onCardTypeChange?.(b);
    if (onChange) {
      onChange({ ...e, target: { ...e.target, value: formatted } });
    }
  };

  const Icon = icons[brand];

  return (
    <div className="mb-4 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          id={inputId}
          name={name}
          autoComplete="cc-number"
          inputMode="numeric"
          aria-label="Card number"
          placeholder="1234 5678 9012 3456"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`input input-bordered w-full pr-10 ${
            error ? 'border-red-500' : ''
          } ${className}`}
          {...registration}
          {...rest}
        />
        <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <Icon size={20} />
        </span>
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default CardNumberInput;
