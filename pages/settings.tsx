import { useState, useEffect, useContext, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import useRequireAuth from '@hooks/useRequireAuth';
import { NotificationContext } from '@contexts/NotificationContext';
import {
  TextInput,
  EmailInput,
  PasswordInput,
  CountrySelect,
  CardNumberInput,
} from '@components/form-fields';
import PageContainer from '@components/Layout/PageContainer';
import countries from '../data/countries';
import type { PaymentMethod } from '../types';
import {
  luhnCheck,
  detectCardBrand,
  isValidCardLength,
  isExpiryValid,
} from '@utils/cardUtils';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface PasswordFormValues {
  password: string;
  confirm: string;
}

interface AddressFormValues {
  address: string;
  city: string;
  country: {
    label: string;
    value: string;
    callingCode: string;
  } | null;
}

interface EmailFormValues {
  email: string;
  token: string;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const SettingsPage: React.FC = () => {
  const user = useRequireAuth();
  const { addNotification } = useContext(NotificationContext);
  const [active, setActive] = useState<
    'profile' | 'password' | 'address' | 'email' | 'payments'
  >('profile');
  const [codeSent, setCodeSent] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const profileForm = useForm<ProfileFormValues>();
  const passwordForm = useForm<PasswordFormValues>();
  const addressForm = useForm<AddressFormValues>();
  const emailForm = useForm<EmailFormValues>();
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

  const tabButtonClass = (tab: typeof active) =>
    `w-full text-left px-2 py-2 rounded transition-colors hover:bg-base-200 ${
      active === tab ? 'text-primary underline font-semibold' : ''
    }`;

  const loadMethods = () => {
    fetch('/api/payment-methods')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMethods(data))
      .catch(() => {});
  };

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
    if (!user) return;
    fetch('/api/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        profileForm.reset({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
        });
        addressForm.reset({
          address: data.address || '',
          city: data.city || '',
          country: countries.find((c) => c.value === data.country) || null,
        });
      })
      .catch(() => {});
  }, [user, profileForm, addressForm]);

  useEffect(() => {
    if (!user) return;
    if (active === 'payments') loadMethods();
  }, [user, active]);

  const submitProfile: SubmitHandler<ProfileFormValues> = async (values) => {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) addNotification('Profile updated', 'success');
    else addNotification('Update failed', 'error');
  };

  const submitPassword: SubmitHandler<PasswordFormValues> = async ({
    password,
  }) => {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) addNotification('Password changed', 'success');
    else addNotification('Change failed', 'error');
    passwordForm.reset();
  };

  const submitAddress: SubmitHandler<AddressFormValues> = async (values) => {
    setSavingAddress(true);
    const payload = {
      address: values.address,
      city: values.city,
      country: values.country?.value || '',
    };
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) addNotification('Address updated', 'success');
    else addNotification('Update failed', 'error');
    setSavingAddress(false);
  };

  const sendCode = async () => {
    const email = emailForm.getValues('email');
    if (!email) return;
    const res = await fetch('/api/request-email-change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setCodeSent(true);
      addNotification('Verification code sent', 'success');
    } else {
      addNotification('Send failed', 'error');
    }
  };

  const submitEmailChange: SubmitHandler<EmailFormValues> = async (values) => {
    const res = await fetch('/api/change-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      addNotification('Email updated', 'success');
      setCodeSent(false);
      emailForm.reset();
    } else {
      addNotification('Update failed', 'error');
    }
  };

  if (!user) return null;

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Head>
          <title>{getPageTitle('Settings')}</title>
        </Head>
        <aside className="md:w-48 w-full">
          <ul className="menu menu-vertical bg-base-100 rounded-box p-2 space-y-1">
            <li>
              <button
                className={tabButtonClass('profile')}
                onClick={() => setActive('profile')}
              >
                Update Profile
              </button>
            </li>
            <li>
              <button
                className={tabButtonClass('password')}
                onClick={() => setActive('password')}
              >
                Change Password
              </button>
            </li>
            <li>
              <button
                className={tabButtonClass('address')}
                onClick={() => setActive('address')}
              >
                Manage Address
              </button>
            </li>
            <li>
              <button
                className={tabButtonClass('email')}
                onClick={() => setActive('email')}
              >
                Change Email
              </button>
            </li>
            <li>
              <button
                className={tabButtonClass('payments')}
                onClick={() => setActive('payments')}
              >
                Payment Methods
              </button>
            </li>
          </ul>
        </aside>
        <div className="flex-1">
          {active === 'profile' && (
            <form
              onSubmit={profileForm.handleSubmit(submitProfile)}
              className="space-y-2 max-w-md mx-auto"
            >
              <h2 className="text-xl font-bold mb-2">Update Profile</h2>
              <TextInput
                label="First Name"
                register={profileForm.register}
                name="firstName"
                rules={{ required: 'Required' }}
                error={profileForm.formState.errors.firstName?.message}
              />
              <TextInput
                label="Last Name"
                register={profileForm.register}
                name="lastName"
                rules={{ required: 'Required' }}
                error={profileForm.formState.errors.lastName?.message}
              />
              <EmailInput
                label="Email"
                register={profileForm.register}
                name="email"
                rules={{ required: 'Required' }}
                error={profileForm.formState.errors.email?.message}
              />
              <TextInput
                label="Phone Number"
                register={profileForm.register}
                name="phoneNumber"
                error={profileForm.formState.errors.phoneNumber?.message}
              />
              <button type="submit" className="btn btn-primary w-full">
                Save
              </button>
            </form>
          )}
          {active === 'password' && (
            <form
              onSubmit={passwordForm.handleSubmit(submitPassword)}
              className="space-y-2 max-w-md mx-auto"
            >
              <h2 className="text-xl font-bold mb-2">Change Password</h2>
              <PasswordInput
                label="New Password"
                register={passwordForm.register}
                name="password"
                rules={{
                  required: 'Required',
                  pattern: { value: passwordRegex, message: 'Weak password' },
                }}
                error={passwordForm.formState.errors.password?.message}
              />
              <PasswordInput
                label="Confirm Password"
                register={passwordForm.register}
                name="confirm"
                rules={{
                  required: 'Required',
                  validate: (v) =>
                    v === passwordForm.getValues('password') ||
                    'Passwords do not match',
                }}
                error={passwordForm.formState.errors.confirm?.message}
              />
              <button type="submit" className="btn btn-primary w-full">
                Change Password
              </button>
            </form>
          )}
          {active === 'address' && (
            <form
              onSubmit={addressForm.handleSubmit(submitAddress)}
              className="space-y-4 max-w-md mx-auto"
            >
              <h2 className="text-xl font-bold mb-2">Manage Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  label="Address"
                  placeholder="123 Main St"
                  register={addressForm.register}
                  name="address"
                  rules={{ required: 'Required' }}
                  error={addressForm.formState.errors.address?.message}
                />
                <TextInput
                  label="City"
                  placeholder="New York"
                  register={addressForm.register}
                  name="city"
                  rules={{ required: 'Required' }}
                  error={addressForm.formState.errors.city?.message}
                />
                <div className="md:col-span-2">
                  <CountrySelect
                    label="Country"
                    name="country"
                    control={addressForm.control}
                    rules={{ required: 'Required' }}
                    error={
                      addressForm.formState.errors.country?.message as string
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={savingAddress}
              >
                {savingAddress ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          )}
          {active === 'email' && (
            <form
              onSubmit={emailForm.handleSubmit(submitEmailChange)}
              className="space-y-2 max-w-md mx-auto"
            >
              <h2 className="text-xl font-bold mb-2">Change Email</h2>
              <EmailInput
                label="New Email"
                register={emailForm.register}
                name="email"
                rules={{ required: 'Required' }}
                error={emailForm.formState.errors.email?.message}
              />
              <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                <div className="flex-1">
                  <TextInput
                    label="Verification Code"
                    register={emailForm.register}
                    name="token"
                    error={emailForm.formState.errors.token?.message}
                    wrapperClassName="mb-0"
                  />
                </div>
                <button
                  type="button"
                  className="btn w-full sm:w-auto"
                  onClick={sendCode}
                >
                  Send Code
                </button>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={!codeSent}
              >
                Confirm
              </button>
            </form>
          )}
          {active === 'payments' && (
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold mb-2">Payment Methods</h2>
              <ul className="space-y-1">
                {methods.map((m) => (
                  <li key={m.id} className="flex justify-between items-center">
                    <span>
                      {m.cardBrand} ****{m.cardLast4} exp {m.expMonth}/
                      {m.expYear}
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
                    className={`input input-bordered w-full ${
                      expError ? 'border-red-500' : ''
                    }`}
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
                    className={`input input-bordered w-full ${
                      expError ? 'border-red-500' : ''
                    }`}
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
                  className={`input input-bordered w-full ${
                    cvcError ? 'border-red-500' : ''
                  }`}
                  placeholder="CVC"
                  maxLength={4}
                  inputMode="numeric"
                />
                {cvcError && <p className="text-sm text-red-600">{cvcError}</p>}
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="default" className="checkbox" />
                  Set as default
                </label>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={!isCardValid}
                >
                  Add Card
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
