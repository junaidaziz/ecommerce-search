import { useContext, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppContext } from '../../contexts/AppContext';
import { signIn } from 'next-auth/react';
import { components, OptionProps, SingleValueProps } from 'react-select';
import countryList from 'react-select-country-list';
import Flag from 'react-world-flags';
import GoogleIcon from '../../components/icons/GoogleIcon';
import GithubIcon from '../../components/icons/GithubIcon';
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
  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirm: string;
    gender: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  }>();
  const [passwordFocused, setPasswordFocused] = useState(false);
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
    const value = getValues('email');
    if (value && !emailRegex.test(value)) {
      setError('email', { type: 'pattern', message: 'Invalid email format' });
      return;
    }
    if (value) {
      try {
        const res = await fetch(`/api/check-email?email=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setError('email', { type: 'manual', message: 'Email already registered' });
          } else {
            clearErrors('email');
          }
        }
      } catch (_) {}
    }
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
  };

  const handleConfirmBlur = () => {
    const password = getValues('password');
    const confirm = getValues('confirm');
    if (password && confirm && password !== confirm) {
      setError('confirm', { type: 'manual', message: 'Passwords do not match' });
    } else {
      clearErrors('confirm');
    }
  };

  const submit = async (values: any) => {
    try {
      const data = await signup('/api/signup/user', {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        gender: values.gender,
        phoneNumber: values.phone,
        address: values.address,
        city: values.city,
        country: values.country,
      });
      router.push(`/confirm/${data.token}`);
    } catch (e) {
      setFormError('Signup failed');
    }
  };

  const passwordValue = watch('password');
  const showPasswordHint =
    passwordFocused || (passwordValue !== '' && !passwordRegex.test(passwordValue));

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
          <GoogleIcon className="h-5 w-5" />
          Continue with Google
        </button>
        <button
          type="button"
          className="btn btn-lg px-6 w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-gray-800 hover:text-white"
          onClick={() => signIn('github')}
        >
          <GithubIcon className="h-5 w-5" />
          Continue with GitHub
        </button>
      </div>
      {formError && <div className="text-red-500 mb-2">{formError}</div>}
      <form onSubmit={handleSubmit(submit)} className="space-y-2">
        <TextInput
          name="firstName"
          placeholder="First Name"
          register={register}
          rules={{ required: 'First name is required' }}
          error={errors.firstName?.message as string}
        />
        <TextInput
          name="lastName"
          placeholder="Last Name"
          register={register}
          rules={{ required: 'Last name is required' }}
          error={errors.lastName?.message as string}
        />
        <EmailInput
          name="email"
          placeholder="Email"
          register={register}
          rules={{
            required: 'Email is required',
            pattern: { value: emailRegex, message: 'Invalid email format' },
            validate: async () => {
              await handleEmailBlur();
              return true;
            },
          }}
          error={errors.email?.message as string}
        />
        <div className="grid grid-cols-2 gap-2">
          <PasswordInput
            name="password"
            placeholder="Password"
            register={register}
            rules={{
              required: 'Password is required',
              pattern: {
                value: passwordRegex,
                message:
                  'Password must be at least 8 characters and include uppercase, lowercase, number and special character',
              },
              onBlur: handlePasswordBlur,
              onFocus: handlePasswordFocus,
            }}
            error={errors.password?.message as string}
          />
          <PasswordInput
            name="confirm"
            placeholder="Confirm Password"
            register={register}
            rules={{ validate: handleConfirmBlur }}
            error={errors.confirm?.message as string}
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
          control={control}
          options={[
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Other', value: 'other' },
          ]}
          placeholder="Select Gender"
        />
        <TextInput
          name="phone"
          placeholder="Phone Number"
          register={register}
        />
        <TextInput
          name="address"
          placeholder="Address"
          register={register}
        />
        <TextInput
          name="city"
          placeholder="City"
          register={register}
        />
        <SelectDropdown
          name="country"
          control={control}
          options={countryOptions}
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
