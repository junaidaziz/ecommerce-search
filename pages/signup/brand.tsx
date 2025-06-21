import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppContext } from '../../contexts/AppContext';
import { signIn } from 'next-auth/react';
import {
  TextInput,
  EmailInput,
  PasswordInput,
} from '../../components/form-fields';
import GoogleIcon from '../../components/icons/GoogleIcon';
import GithubIcon from '../../components/icons/GithubIcon';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function BrandSignup() {
  const router = useRouter();
  const { signup, user } = useContext(AppContext)!;
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<{ firstName: string; email: string; password: string; confirm: string }>();
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user) {
      if (user.role === 'brand') router.push('/brand/profile');
      else router.push('/user/profile');
    }
  }, [user, router]);

  const handleEmailBlur = async () => {
    const value = getValues('email');
    if (value && emailRegex.test(value)) {
      try {
        const res = await fetch(`/api/check-email?email=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            return 'Email already registered';
          }
        }
      } catch (_) {}
    }
    return true;
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
      return 'Passwords do not match';
    }
    return true;
  };

  const submit = async (values: any) => {
    try {
      const data = await signup<{ token: string }>('/api/signup/brand', {
        firstName: values.firstName,
        email: values.email,
        password: values.password,
      });
      router.push(`/confirm/${data.token}`);
    } catch (e) {
      setFormError('Signup failed');
    }
  };

  const passwordValue = watch('password');
  const showPasswordHint =
    passwordFocused || (passwordValue !== '' && !passwordRegex.test(passwordValue || ''));

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto mt-10 border border-gray-200 rounded-lg shadow-sm p-6 bg-white w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Brand Sign Up</h1>
        </div>
        <div className="flex flex-col gap-6 mb-4">
          <button
            type="button"
            className="btn btn-lg w-full flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white rounded-lg"
            onClick={() => signIn('google')}
          >
            <GoogleIcon className="h-5 w-5" />
            Continue with Google
          </button>
          <button
            type="button"
            className="btn btn-lg w-full flex items-center justify-center gap-2 hover:bg-gray-800 hover:text-white rounded-lg"
            onClick={() => signIn('github')}
          >
            <GithubIcon className="h-5 w-5" />
            Continue with GitHub
          </button>
        </div>
        {formError && <div className="text-red-500 mb-2">{formError}</div>}
        <form id="brand-signup-form" onSubmit={handleSubmit(submit)} className="space-y-6">
          <TextInput
            name="firstName"
            placeholder="First Name"
            required
            register={register}
            rules={{ required: 'firstName is required' }}
            error={errors.firstName?.message as string}
          />
          <EmailInput
            name="email"
            placeholder="Email"
            required
            register={register}
            rules={{
              required: 'Email is required',
              pattern: { value: emailRegex, message: 'Invalid email format' },
              validate: handleEmailBlur,
            }}
            error={errors.email?.message as string}
          />
          <div className="space-y-5">
            <PasswordInput
              name="password"
              aria-describedby="password-help"
              placeholder="Password"
              required
              register={register}
              rules={{
                required: 'Password is required',
                pattern: {
                  value: passwordRegex,
                  message:
                    'Password must be at least 8 characters and include uppercase, lowercase, number and special character',
                },
                onBlur: handlePasswordBlur,
              }}
              onFocus={handlePasswordFocus}
              error={errors.password?.message as string}
            />
            <PasswordInput
              name="confirm"
              placeholder="Confirm Password"
              required
              register={register}
              rules={{ validate: handleConfirmBlur }}
              error={errors.confirm?.message as string}
            />
            {showPasswordHint && (
              <p id="password-help" className="text-sm text-gray-500">
                Password must be at least 8 characters and include uppercase, lowercase, number and special character
              </p>
            )}
          </div>
          <button
            className="btn btn-primary w-full mt-8"
            type="submit"
          >
            Create Brand Account
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="link">
            Login
          </Link>
        </p>
        <p className="text-sm text-center mt-4 text-gray-600">
          Not a brand?{' '}
          <Link href="/signup/user" className="text-blue-600 hover:underline">
            Sign up as a user instead
          </Link>
        </p>
      </div>
    </div>
  );
}
