import { useState, useContext, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppContext } from '../../contexts/AppContext';
import { signIn } from 'next-auth/react';
import { components, OptionProps, SingleValueProps } from 'react-select';
import countryList from 'react-select-country-list';
import Flag from 'react-world-flags';
import {
  TextInput,
  EmailInput,
  PasswordInput,
  SelectDropdown,
} from '../../components/form-fields';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

type CountryOptionType = { label: string; value: string };

const CountryOption = (props: OptionProps<CountryOptionType, false>) => (
  <components.Option {...props}>
    <div className="flex items-center gap-2">
      <Flag code={props.data.value} style={{ width: 20, height: 15 }} />
      <span aria-label={props.data.label}>{props.data.label}</span>
    </div>
  </components.Option>
);

const CountrySingleValue = (props: SingleValueProps<CountryOptionType, false>) => (
  <components.SingleValue {...props}>
    <div className="flex items-center gap-2">
      <Flag code={props.data.value} style={{ width: 20, height: 15 }} />
      <span aria-label={props.data.label}>{props.data.label}</span>
    </div>
  </components.SingleValue>
);

export default function UserSignup() {
  const router = useRouter();
  const { signup, user } = useContext(AppContext)!;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const countryOptions = useMemo(
    () =>
      countryList()
        .getData()
        .map((c) => ({ label: `${c.label} (${c.value})`, value: c.value })),
    []
  );

  useEffect(() => {
    if (user) {
      if (user.role === 'brand') router.push('/brand/dashboard');
      else if (user.role === 'super-admin') router.push('/admin');
      else router.push('/user/dashboard');
    }
  }, [user, router]);

  const handleEmailBlur = async () => {
    setErrors((prev) => {
      const next = { ...prev };
      if (email && !emailRegex.test(email)) {
        next.email = 'Invalid email format';
      } else if (
        next.email === 'Invalid email format' ||
        next.email === 'Email already registered'
      ) {
        delete next.email;
      }
      return next;
    });
    if (email && emailRegex.test(email)) {
      try {
        const res = await fetch(
          `/api/check-email?email=${encodeURIComponent(email)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setErrors((prev) => ({
              ...prev,
              email: 'Email already registered',
            }));
          }
        }
      } catch (_) { }
    }
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    setErrors((prev) => {
      const next = { ...prev };
      if (password && !passwordRegex.test(password)) {
        next.password =
          'Password must be at least 8 characters and include uppercase, lowercase, number and special character';
      } else if (next.password && next.password.startsWith('Password must')) {
        delete next.password;
      }
      if (confirm && password !== confirm) {
        next.confirm = 'Passwords do not match';
      } else if (next.confirm === 'Passwords do not match') {
        delete next.confirm;
      }
      return next;
    });
  };

  const handleConfirmBlur = () => {
    setErrors((prev) => {
      const next = { ...prev };
      if (password && confirm && password !== confirm) {
        next.confirm = 'Passwords do not match';
      } else if (next.confirm === 'Passwords do not match') {
        delete next.confirm;
      }
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (!confirm) newErrors.confirm = 'Confirm password is required';
    if (password && confirm && password !== confirm) {
      newErrors.confirm = 'Passwords do not match';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const data = await signup('/api/signup/user', {
        firstName,
        lastName,
        email,
        password,
        gender,
        phoneNumber,
        address,
        city,
        country,
      });
      router.push(`/confirm/${data.token}`);
    } catch (e) {
      setFormError('Signup failed');
    }
  };

  const showPasswordHint =
    passwordFocused || (password !== '' && !passwordRegex.test(password));

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto mt-10 border border-gray-200 rounded-lg shadow-sm p-6 bg-white w-full">
        <h1 className="text-2xl font-bold mb-4">User Sign Up</h1>
      <div className="flex flex-col gap-6 mb-4">
        <button
          type="button"
          className="btn btn-lg px-6 w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white"
          onClick={() => signIn('google')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5"
          >
            <path
              fill="currentColor"
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.362 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            />
          </svg>
          Continue with Google
        </button>
        <button
          type="button"
          className="btn btn-lg px-6 w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-gray-800 hover:text-white"
          onClick={() => signIn('github')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5"
          >
            <path
              fill="currentColor"
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.77.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.812 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            />
          </svg>
          Continue with GitHub
        </button>
      </div>
      {formError && <div className="text-red-500 mb-2">{formError}</div>}
      <form onSubmit={submit} className="space-y-2">
        <TextInput
          name="firstName"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errors.firstName as string}
        />
        <TextInput
          name="lastName"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errors.lastName as string}
        />
        <EmailInput
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={handleEmailBlur}
          error={errors.email as string}
        />
        <div className="grid grid-cols-2 gap-2">
          <PasswordInput
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={handlePasswordFocus}
            onBlur={handlePasswordBlur}
            error={errors.password as string}
          />
          <PasswordInput
            name="confirm"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={handleConfirmBlur}
            error={errors.confirm as string}
          />
        </div>
        {showPasswordHint && (
          <p id="password-help" className="text-sm text-gray-500">
            Password must be at least 8 characters and include uppercase,
            lowercase, number and special character
          </p>
        )}
        <SelectDropdown
          name="gender"
          options={[
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Other', value: 'other' },
          ]}
          value={gender ? { label: gender.charAt(0).toUpperCase() + gender.slice(1), value: gender } : null}
          onChange={(opt) => setGender((opt as any)?.value || '')}
          placeholder="Select Gender"
        />
        <TextInput
          name="phone"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <TextInput
          name="address"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <TextInput
          name="city"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <SelectDropdown
          name="country"
          options={countryOptions}
          value={country ? countryOptions.find((c) => c.label === country) : null}
          onChange={(opt) => setCountry((opt as any)?.label || '')}
          placeholder="Country"
          components={{ Option: CountryOption, SingleValue: CountrySingleValue }}
        />
        <button className="btn btn-primary w-full" type="submit">
          Sign Up
        </button>
      </form>
      <p className="text-center mt-4">
        Already have an account?{' '}
        <Link href="/login" className="link">
          Login
        </Link>
      </p>
      <p className="text-sm text-center mt-4 text-gray-600">
        Want to sign up as a brand instead?{' '}
        <Link href="/signup/brand" className="text-blue-600 hover:underline">
          Sign up as a brand instead
        </Link>
      </p>
      </div>
    </div>
  );
}
