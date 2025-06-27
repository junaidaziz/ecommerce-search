import { useState, useEffect, useContext } from 'react';
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
} from '@components/form-fields';
import countries from '../data/countries';
import type { PaymentMethod } from '../types';

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

  const profileForm = useForm<ProfileFormValues>();
  const passwordForm = useForm<PasswordFormValues>();
  const addressForm = useForm<AddressFormValues>();
  const emailForm = useForm<EmailFormValues>();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  const loadMethods = () => {
    fetch('/api/payment-methods')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMethods(data))
      .catch(() => {});
  };

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
    <div className="flex flex-col md:flex-row gap-6">
      <Head>
        <title>{getPageTitle('Settings')}</title>
      </Head>
      <aside className="md:w-48 w-full">
        <ul className="menu menu-vertical bg-base-100 rounded-box">
          <li>
            <button
              className={active === 'profile' ? 'active' : ''}
              onClick={() => setActive('profile')}
            >
              Update Profile
            </button>
          </li>
          <li>
            <button
              className={active === 'password' ? 'active' : ''}
              onClick={() => setActive('password')}
            >
              Change Password
            </button>
          </li>
          <li>
            <button
              className={active === 'address' ? 'active' : ''}
              onClick={() => setActive('address')}
            >
              Manage Address
            </button>
          </li>
          <li>
            <button
              className={active === 'email' ? 'active' : ''}
              onClick={() => setActive('email')}
            >
              Change Email
            </button>
          </li>
          <li>
            <button
              className={active === 'payments' ? 'active' : ''}
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
            className="space-y-2 max-w-md mx-auto"
          >
            <h2 className="text-xl font-bold mb-2">Manage Address</h2>
            <TextInput
              label="Address"
              register={addressForm.register}
              name="address"
              rules={{ required: 'Required' }}
              error={addressForm.formState.errors.address?.message}
            />
            <TextInput
              label="City"
              register={addressForm.register}
              name="city"
              rules={{ required: 'Required' }}
              error={addressForm.formState.errors.city?.message}
            />
            <CountrySelect
              label="Country"
              name="country"
              control={addressForm.control}
              rules={{ required: 'Required' }}
              error={addressForm.formState.errors.country?.message as string}
            />
            <button type="submit" className="btn btn-primary w-full">
              Save Address
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
            <div className="flex items-end gap-2">
              <TextInput
                label="Verification Code"
                register={emailForm.register}
                name="token"
                error={emailForm.formState.errors.token?.message}
              />
              <button type="button" className="btn" onClick={sendCode}>
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
                const form = e.currentTarget as HTMLFormElement;
                const data = {
                  number: (form.number as HTMLInputElement).value,
                  expMonth: (form.expMonth as HTMLInputElement).value,
                  expYear: (form.expYear as HTMLInputElement).value,
                  cvc: (form.cvc as HTMLInputElement).value,
                  setDefault: (form.default as HTMLInputElement).checked,
                };
                fetch('/api/payment-methods', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                })
                  .then(() => {
                    form.reset();
                    loadMethods();
                  })
                  .catch(() => {});
              }}
              className="space-y-2"
            >
              <input
                name="number"
                className="input input-bordered w-full"
                placeholder="Card Number"
              />
              <div className="flex gap-2">
                <input
                  name="expMonth"
                  className="input input-bordered w-full"
                  placeholder="MM"
                />
                <input
                  name="expYear"
                  className="input input-bordered w-full"
                  placeholder="YYYY"
                />
              </div>
              <input
                name="cvc"
                className="input input-bordered w-full"
                placeholder="CVC"
              />
              <label className="flex items-center gap-2">
                <input type="checkbox" name="default" className="checkbox" />
                Set as default
              </label>
              <button type="submit" className="btn btn-primary w-full">
                Add Card
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
