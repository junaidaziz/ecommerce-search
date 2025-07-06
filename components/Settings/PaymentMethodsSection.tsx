import { apiFetch } from '@lib/api';
import { useEffect, useState, useRef } from 'react';
import { CardNumberInput } from '@components/form-fields';
import type { PaymentMethod } from '@/types';
import {
  luhnCheck,
  detectCardBrand,
  isValidCardLength,
  isExpiryValid,
} from '@utils/cardUtils';
import { CreditCardIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';

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
  const [loading, setLoading] = useState(false);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const cvcRef = useRef<HTMLInputElement>(null);

  const loadMethods = () => {
    apiFetch('/api/payment-methods')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/login';
          return [] as PaymentMethod[];
        }
        return res.ok ? res.json() : [];
      })
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

  const handleMakeDefault = async (methodId: string) => {
    setLoading(true);
    await apiFetch(`/api/payment-methods/${methodId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ makeDefault: true }),
    }).then(loadMethods);
    setLoading(false);
  };

  const handleDelete = async (methodId: string) => {
    setLoading(true);
    await apiFetch(`/api/payment-methods/${methodId}`, {
      method: 'DELETE',
    }).then(loadMethods);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-4">
      {/* Existing Payment Methods */}
      <div className="bg-base-100 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-full">
            <CreditCardIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Payment Methods</h2>
            <p className="text-sm text-gray-600">Manage your saved payment cards</p>
          </div>
        </div>
        
        {methods.length > 0 ? (
          <div className="space-y-3">
            {methods.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-base-50 rounded-lg border border-base-200">
                <div className="flex items-center gap-3">
                  <CreditCardIcon className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">
                      {m.cardBrand} ****{m.cardLast4}
                    </div>
                    <div className="text-sm text-gray-600">
                      Expires {String(m.expMonth)}/{String(m.expYear)}
                    </div>
                  </div>
                  {m.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      <StarIcon className="w-3 h-3" />
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!m.isDefault && (
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleMakeDefault(String(m.id))}
                      disabled={loading}
                    >
                      Make Default
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-error btn-outline"
                    onClick={() => handleDelete(String(m.id))}
                    disabled={loading}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CreditCardIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No payment methods added yet</p>
          </div>
        )}
      </div>

      {/* Add New Payment Method */}
      <div className="bg-base-100 rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Card</h3>
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
            apiFetch('/api/payment-methods', {
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
          className="space-y-4"
        >
          <CardNumberInput
            name="number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            error={cardError}
          />
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">
                <span className="label-text">Month</span>
              </label>
              <input
                name="expMonth"
                ref={monthRef}
                value={expMonth}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setExpMonth(v);
                  if (v.length === 2) yearRef.current?.focus();
                }}
                className={`input input-bordered w-full ${expError ? 'input-error' : ''}`}
                placeholder="MM"
                maxLength={2}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Year</span>
              </label>
              <input
                name="expYear"
                ref={yearRef}
                value={expYear}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setExpYear(v);
                  if (v.length === 4) cvcRef.current?.focus();
                }}
                className={`input input-bordered w-full ${expError ? 'input-error' : ''}`}
                placeholder="YYYY"
                maxLength={4}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">CVC</span>
              </label>
              <input
                name="cvc"
                ref={cvcRef}
                value={cvc}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  setCvc(v.slice(0, 4));
                }}
                className={`input input-bordered w-full ${cvcError ? 'input-error' : ''}`}
                placeholder="CVC"
                maxLength={4}
                inputMode="numeric"
              />
            </div>
          </div>
          
          {(expError || cvcError) && (
            <div className="text-sm text-error">
              {expError && <p>{expError}</p>}
              {cvcError && <p>{cvcError}</p>}
            </div>
          )}
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="default" className="checkbox checkbox-primary" />
            <span className="label-text">Set as default payment method</span>
          </label>
          
          <button
            type="submit"
            className="btn btn-primary w-full shadow-lg"
            disabled={!isCardValid}
          >
            Add Payment Method
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodsSection;
