import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppContext } from '@contexts/AppContext';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import BuildingIcon from '@components/icons/BuildingIcon';
import GoogleIcon from '@components/icons/GoogleIcon';
import FacebookIcon from '@components/icons/FacebookIcon';
import {
  EmailInput,
  PasswordInput,
  TextInput,
} from '@components/form-fields';
import useEmailAvailability from '@hooks/useEmailAvailability';
import { USER_ROLES } from '@/types';

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
  } = useForm<{
    firstName: string;
    email: string;
    password: string;
    confirm: string;
  }>({ mode: 'onChange' });
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user) {
      if (user.role === USER_ROLES.BRAND) router.push('/brand/profile?complete=1');
      else if (user.role === USER_ROLES.SUPER_ADMIN) router.push('/admin');
      else router.push('/user/profile?complete=1');
    }
  }, [user, router]);

  const { checkingEmail, handleEmailBlur } = useEmailAvailability(
    watch,
    getValues,
    setError,
    clearErrors
  );

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
      setError('confirm', {
        type: 'manual',
        message: 'Passwords do not match',
      });
      return 'Passwords do not match';
    }
    clearErrors('confirm');
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
    passwordFocused ||
    (passwordValue !== '' && !passwordRegex.test(passwordValue));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center py-8 px-4">
      <Head>
        <title>{getPageTitle('Brand Signup')}</title>
      </Head>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10 relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-purple-100 mb-3">
            <BuildingIcon className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Your Brand Account</h1>
          <p className="text-gray-500 text-center text-base">Sign up to start selling, manage your store, and grow your business.</p>
        </div>
        <div className="flex flex-col gap-3 mb-6">
          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-gray-200 bg-white hover:bg-purple-50 transition-colors text-gray-700 font-medium shadow-sm"
            onClick={() => {
              document.cookie = 'signupRole=BRAND; path=/';
              signIn('google');
            }}
          >
            <GoogleIcon className="h-5 w-5" />
            Continue with Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-gray-200 bg-white hover:bg-purple-100 transition-colors text-gray-700 font-medium shadow-sm"
            onClick={() => {
              document.cookie = 'signupRole=BRAND; path=/';
              signIn('facebook');
            }}
          >
            <FacebookIcon className="h-5 w-5" />
            Continue with Facebook
          </button>
        </div>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-gray-400 font-medium">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
        {formError && <div className="text-red-500 mb-2 text-center">{formError}</div>}
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <TextInput
            name="firstName"
            placeholder="First Name"
            register={register}
            rules={{ required: 'First name is required' }}
            error={errors.firstName?.message as string}
          />
          <EmailInput
            name="email"
            placeholder="Email"
            register={register}
            onBlur={handleEmailBlur}
            rules={{
              required: 'Email is required',
              pattern: { value: emailRegex, message: 'Invalid email format' },
            }}
            error={errors.email?.message as string}
          />
          <div className="space-y-2">
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
              }}
              onFocus={handlePasswordFocus}
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
          <button
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            type="submit"
            disabled={checkingEmail || !!errors.email}
          >
            {checkingEmail && (
              <span className="loading loading-spinner mr-2"></span>
            )}
            Sign Up
          </button>
        </form>
        <p className="text-center mt-6 text-gray-700">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </p>
        <p className="text-sm text-center mt-2 text-gray-500">
          Not a brand?{' '}
          <Link href="/signup/user" className="text-blue-600 hover:underline font-medium">
            Sign up as a user
          </Link>
        </p>
      </div>
    </div>
  );
}
