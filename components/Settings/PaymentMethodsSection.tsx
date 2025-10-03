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
import { FaPaypal } from 'react-icons/fa';

type PaymentType = 'card' | 'paypal';

const PaymentMethodsSection: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [paymentType, setPaymentType] = useState<PaymentType>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardError, setCardError] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [expError, setExpError] = useState('');
  const [cvcError, setCvcError] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalError, setPaypalError] = useState('');
  const [isCardValid, setIsCardValid] = useState(false);
  const [isPayPalValid, setIsPayPalValid] = useState(false);
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

  useEffect(() => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmail = emailRegex.test(paypalEmail);
    setPaypalError(validEmail || !paypalEmail ? '' : 'Invalid email address');
    setIsPayPalValid(validEmail);
  }, [paypalEmail]);

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
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Existing Payment Methods */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
            <CreditCardIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Methods</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your saved payment cards</p>
          </div>
        </div>
        
        {methods.length > 0 ? (
          <div className="space-y-3">
            {methods.map((m) => (
              <div key={m.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 gap-3">
                <div className="flex items-center gap-3">
                  {m.provider === 'paypal' ? (
                    <FaPaypal className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  ) : (
                    <CreditCardIcon className="w-6 h-6 text-primary flex-shrink-0" />
                  )}
                  <div>
                    {m.provider === 'paypal' ? (
                      <>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          PayPal
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {m.paypalEmail}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {m.cardBrand} ****{m.cardLast4}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Expires {String(m.expMonth)}/{String(m.expYear)}
                        </div>
                      </>
                    )}
                  </div>
                  {m.isDefault && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-xs rounded-full font-semibold">
                      <StarIcon className="w-3 h-3" />
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!m.isDefault && (
                    <button
                      className="px-4 py-2 text-sm font-medium text-primary hover:text-white bg-primary/10 hover:bg-primary dark:bg-primary/20 dark:hover:bg-primary rounded-lg transition-all duration-200 disabled:opacity-50"
                      onClick={() => handleMakeDefault(String(m.id))}
                      disabled={loading}
                    >
                      Make Default
                    </button>
                  )}
                  <button
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-white bg-red-50 hover:bg-red-600 dark:bg-red-900/20 dark:hover:bg-red-600 rounded-lg transition-all duration-200 disabled:opacity-50"
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
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <CreditCardIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium">No payment methods added yet</p>
            <p className="text-sm">Add a card or PayPal account below to get started</p>
          </div>
        )}
      </div>

      {/* Add New Payment Method */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add New Payment Method</h3>
        
        {/* Payment Type Selector */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setPaymentType('card')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              paymentType === 'card'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <CreditCardIcon className="w-5 h-5" />
            Credit/Debit Card
          </button>
          <button
            type="button"
            onClick={() => setPaymentType('paypal')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              paymentType === 'paypal'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <FaPaypal className="w-5 h-5" />
            PayPal
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            
            if (paymentType === 'card' && !isCardValid) return;
            if (paymentType === 'paypal' && !isPayPalValid) return;
            
            const data: any = {
              provider: paymentType,
              setDefault: (form.default as HTMLInputElement).checked,
            };
            
            if (paymentType === 'card') {
              data.number = cardNumber.replace(/\s+/g, '');
              data.expMonth = expMonth.trim();
              data.expYear = expYear.trim();
              data.cvc = cvc.trim();
            } else {
              data.paypalEmail = paypalEmail.trim();
            }
            
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
                setPaypalEmail('');
                loadMethods();
              })
              .catch(() => {});
          }}
          className="space-y-5"
        >
          {paymentType === 'card' ? (
            <>
              <CardNumberInput
                name="number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                error={cardError}
              />
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Month
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
                    className={`w-full px-4 py-2.5 rounded-lg border ${expError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    placeholder="MM"
                    maxLength={2}
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
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
                    className={`w-full px-4 py-2.5 rounded-lg border ${expError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    placeholder="YYYY"
                    maxLength={4}
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVC
                  </label>
                  <input
                    name="cvc"
                    ref={cvcRef}
                    value={cvc}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '');
                      setCvc(v.slice(0, 4));
                    }}
                    className={`w-full px-4 py-2.5 rounded-lg border ${cvcError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    placeholder="CVC"
                    maxLength={4}
                    inputMode="numeric"
                  />
                </div>
              </div>
              
              {(expError || cvcError) && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {expError && <p>{expError}</p>}
                  {cvcError && <p>{cvcError}</p>}
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PayPal Email Address
                </label>
                <input
                  type="email"
                  name="paypalEmail"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border ${paypalError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                  placeholder="your.email@example.com"
                />
                {paypalError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{paypalError}</p>
                )}
              </div>
            </>
          )}
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="default" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Set as default payment method</span>
          </label>
          
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="submit"
              className="px-8 py-3 text-base font-semibold text-white bg-success hover:bg-success-dark dark:bg-success dark:hover:bg-success-light rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={paymentType === 'card' ? !isCardValid : !isPayPalValid}
            >
              Add Payment Method
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodsSection;
