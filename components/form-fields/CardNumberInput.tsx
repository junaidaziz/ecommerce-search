import React, { useEffect, useState } from 'react';
import { IMaskInput } from 'react-imask';
import type { InputMask } from 'imask';
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
import { CardBrand, detectCardBrand, getCardMaxLength } from '@utils/cardUtils';

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

type BrandMap = {
  [key in CardBrand]: React.FC<{ size?: string | number; className?: string }>;
};

const icons: BrandMap = {
  visa: VisaIcon,
  mastercard: MastercardIcon,
  amex: AmexIcon,
  discover: DiscoverIcon,
  unknown: CreditCardIcon,
};

const CardNumberInput = <T extends FieldValues>(
  props: CardNumberInputProps<T>
) => {
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
  const registration: {
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    ref?: ((instance: HTMLInputElement | null) => void) | React.MutableRefObject<HTMLInputElement | null> | null;
  } = register
    ? register(name, rules)
    : { onBlur: undefined, onChange: undefined, ref: undefined };
  const [value, setValue] = useState(valueProp || '');
  const [brand, setBrand] = useState<CardBrand>('unknown');

  useEffect(() => {
    const val = valueProp || '';
    setValue(val);
    setBrand(detectCardBrand(val));
  }, [valueProp]);

  const handleAccept = (val: string, mask: InputMask<{ unmaskedValue: string; value: string }>) => {
    try {
      const digits = mask.unmaskedValue;
      const b = detectCardBrand(digits);
      const max = getCardMaxLength(b);
      const trimmedDigits = digits.slice(0, max);
      if (trimmedDigits !== digits) {
        mask.unmaskedValue = trimmedDigits;
        val = mask.value;
      }
      setValue(val);
      setBrand(b);
      onCardTypeChange?.(b);
      const event = { target: { value: val, name } } as unknown as React.ChangeEvent<HTMLInputElement>;
      if (register && registration && 'onChange' in registration && typeof registration.onChange === 'function') {
        registration.onChange(event);
      }
      onChange?.(event);
    } catch (err) {
      console.error('CardNumberInput handleAccept error', err);
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
        <IMaskInput
          mask="0000 0000 0000 0000[ 000]"
          id={inputId}
          name={name}
          autoComplete="cc-number"
          inputMode="numeric"
          aria-label="Card number"
          placeholder="1234 5678 9012 3456"
          value={value}
          onAccept={handleAccept}
          onBlur={(e) => {
            if (typeof registration.onBlur === 'function') {
              registration.onBlur(e);
            }
            onBlur?.(e);
          }}
          disabled={disabled}
          className={`input input-bordered w-full pr-10 ${
            error ? 'border-red-500' : ''
          } ${className}`}
          inputRef={(ref: HTMLInputElement | null) => {
            if (typeof registration.ref === 'function') registration.ref(ref);
            else if (registration.ref)
              (
                registration.ref as React.MutableRefObject<HTMLInputElement | null>
              ).current = ref;
          }}
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
