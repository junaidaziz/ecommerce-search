import React, { useEffect, useRef, useState } from 'react';
import Cleave from 'cleave.js/react';
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
  [key in CardBrand]: React.FC<{ size?: number; className?: string }>;
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
  const registration = register ? register(name, rules) : {};
  const [value, setValue] = useState(valueProp || '');
  const [brand, setBrand] = useState<CardBrand>('unknown');
  const cleaveRef = useRef<any>(null);
  const [cleaveReady, setCleaveReady] = useState(false);

  const safeSetRawValue = (raw: string) => {
    const cleave = cleaveRef.current;
    if (cleaveReady && cleave && typeof cleave.setRawValue === 'function') {
      try {
        cleave.setRawValue(raw);
      } catch (err) {
        console.error('Cleave setRawValue failed', err);
      }
    }
  };

  useEffect(() => {
    const val = valueProp || '';
    setValue(val);
    setBrand(detectCardBrand(val));
    const digits = val.replace(/\D/g, '');
    safeSetRawValue(digits);
  }, [valueProp]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const digits = e.target.value.replace(/\D/g, '');
      const b = detectCardBrand(digits);
      const max = getCardMaxLength(b);
      const raw = digits.slice(0, max);
      const cleave = cleaveRef.current;
      let formatted = raw;
      if (cleave && typeof cleave.setRawValue === 'function') {
        safeSetRawValue(raw);
        try {
          formatted = cleave.getFormattedValue();
        } catch (err) {
          console.error('Cleave getFormattedValue failed', err);
          formatted = raw;
        }
      } else {
        formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      }
      setValue(formatted);
      setBrand(b);
      onCardTypeChange?.(b);
      if (onChange) {
        onChange({ ...e, target: { ...e.target, value: formatted } });
      }
    } catch (err) {
      console.error('CardNumberInput handleChange error', err);
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
        <Cleave
          options={{ creditCard: true, creditCardStrictMode: true }}
          id={inputId}
          name={name}
          autoComplete="cc-number"
          inputMode="numeric"
          aria-label="Card number"
          placeholder="1234 5678 9012 3456"
          value={value}
          onChange={(e) => {
            registration.onChange?.(e);
            handleChange(e);
          }}
          onBlur={(e) => {
            registration.onBlur?.(e);
            onBlur?.(e);
          }}
          disabled={disabled}
          className={`input input-bordered w-full pr-10 ${
            error ? 'border-red-500' : ''
          } ${className}`}
          htmlRef={(ref: any) => {
            if (typeof registration.ref === 'function') registration.ref(ref);
            else if (registration.ref)
              (
                registration.ref as React.MutableRefObject<HTMLInputElement | null>
              ).current = ref;
          }}
          onInit={(cleave) => {
            cleaveRef.current = cleave;
            setCleaveReady(true);
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
