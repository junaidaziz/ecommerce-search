import { useEffect, useState, useRef } from 'react';
import { CardNumberInput } from '@components/form-fields';
import type { PaymentMethod } from '../../types';
import {
  luhnCheck,
  detectCardBrand,
  isValidCardLength,
  isExpiryValid,
} from '@utils/cardUtils';

const PaymentMethodsSection: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [cardNumber, setCardNumber] = useState('');
  const [cardError, setCardError] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [expError, setExpError] = useState('');
  const [cvcError, setCvcError] = useState('');
  const [isCardValid, setIsCardValid] = useState(false);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const cvcRef = useRef<HTMLInputElement>(null);

  const loadMethods = () => {
    fetch('/api/payment-methods')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMethods(data))
      .catch(() => {});
  };

  useEffect(loadMethods, []);

  useEffect(() => {
    const number = cardNumber.replace(/\s+/g, '');
    const brand = detectCardBrand(number);
    const validNumber = luhnCheck(number) && isValidCardLength(number, brand);
    setCardError(validNumber || !number ? '' : 'Invalid card number');
    const expValid = isExpiryValid(expMonth, expYear);
    setExpError(expValid || (!expMonth && !expYear) ? '' : 'Invalid expiry');
    const cvcLen = brand === 'amex' ? 4 : 3;
    const cvcValid = /^\d+$/.test(cvc) && cvc.length === cvcLen;
    setCvcError(cvcValid || !cvc ? '' : 'Invalid CVC');
    setIsCardValid(validNumber && expValid && cvcValid);
  }, [cardNumber, expMonth, expYear, cvc]);

  return (
    <div className="space-y-2 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Payment Methods</h2>
      <ul className="space-y-1">
        {methods.map((m) => (
          <li key={m.id} className="flex justify-between items-center">
            <span>
              {m.cardBrand} ****{m.cardLast4} exp {m.expMonth}/{m.expYear}
              {m.isDefault && ' (default)'}
            </span>
            <div className="flex gap-2">
              {!m.isDefault && (
                <button
                  className="btn btn-xs"
                  onClick={() =>
                    fetch(`/api/payment-methods/${m.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ makeDefault: true }),
                    }).then(loadMethods)
                  }
                >
                  Make Default
                </button>
              )}
              <button
                className="btn btn-xs"
                onClick={() =>
                  fetch(`/api/payment-methods/${m.id}`, {
                    method: 'DELETE',
                  }).then(loadMethods)
                }
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isCardValid) return;
          const form = e.currentTarget as HTMLFormElement;
          const data = {
            number: cardNumber.replace(/\s+/g, ''),
            expMonth: expMonth.trim(),
            expYear: expYear.trim(),
            cvc: cvc.trim(),
            setDefault: (form.default as HTMLInputElement).checked,
          };
          fetch('/api/payment-methods', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
            .then(() => {
              form.reset();
              setCardNumber('');
              setExpMonth('');
              setExpYear('');
              setCvc('');
              loadMethods();
            })
            .catch(() => {});
        }}
        className="space-y-2"
      >
        <CardNumberInput
          name="number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          error={cardError}
        />
        <div className="flex gap-2">
          <input
            name="expMonth"
            ref={monthRef}
            value={expMonth}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 2);
              setExpMonth(v);
              if (v.length === 2) yearRef.current?.focus();
            }}
            className={`input input-bordered w-full ${expError ? 'border-red-500' : ''}`}
            placeholder="MM"
            maxLength={2}
            inputMode="numeric"
          />
          <input
            name="expYear"
            ref={yearRef}
            value={expYear}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4);
              setExpYear(v);
              if (v.length === 4) cvcRef.current?.focus();
            }}
            className={`input input-bordered w-full ${expError ? 'border-red-500' : ''}`}
            placeholder="YYYY"
            maxLength={4}
            inputMode="numeric"
          />
        </div>
        {expError && <p className="text-sm text-red-600">{expError}</p>}
        <input
          name="cvc"
          ref={cvcRef}
          value={cvc}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '');
            setCvc(v.slice(0, 4));
          }}
          className={`input input-bordered w-full ${cvcError ? 'border-red-500' : ''}`}
          placeholder="CVC"
          maxLength={4}
          inputMode="numeric"
        />
        {cvcError && <p className="text-sm text-red-600">{cvcError}</p>}
        <label className="flex items-center gap-2">
          <input type="checkbox" name="default" className="checkbox" />
          Set as default
        </label>
        <button type="submit" className="btn btn-primary w-full" disabled={!isCardValid}>
          Add Card
        </button>
      </form>
    </div>
  );
};

export default PaymentMethodsSection;
