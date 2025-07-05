import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppContext } from '@contexts/AppContext';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import PageContainer from '@components/Layout/PageContainer';
import GoogleIcon from '@components/icons/GoogleIcon';
import FacebookIcon from '@components/icons/FacebookIcon';
import {
  EmailInput,
  PasswordInput,
  TextInput,
} from '@components/form-fields';
import useEmailAvailability from '@hooks/useEmailAvailability';
import { UserRole } from '@/types';

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
      if (user.role === UserRole.BRAND) router.push('/brand/profile?complete=1');
      else if (user.role === UserRole.SUPER_ADMIN) router.push('/admin');
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
    <div className="min-h-screen flex items-center justify-center overflow-auto px-4 py-6 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Brand Signup')}</title>
      </Head>
      <PageContainer className="max-w-xs -mt-12">
        <h1 className="text-2xl font-bold mb-4 text-center">Brand Sign Up</h1>
        <div className="flex flex-col gap-4 mb-6">
          <button
            type="button"
            className="btn btn-lg px-6 w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white"
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
            className="btn btn-lg px-6 w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-blue-700 hover:text-white"
            onClick={() => {
              document.cookie = 'signupRole=BRAND; path=/';
              signIn('facebook');
            }}
          >
            <FacebookIcon className="h-5 w-5" />
            Continue with Facebook
          </button>
        </div>
        {formError && <div className="text-red-500 mb-2">{formError}</div>}
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
            className="btn btn-primary w-full"
            type="submit"
            disabled={checkingEmail || !!errors.email}
          >
            {checkingEmail && (
              <span className="loading loading-spinner mr-2"></span>
            )}
            Sign Up
          </button>
        </form>
        <p className="text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="link">
            Login
          </Link>
        </p>
        <p className="text-sm text-center mt-2 text-gray-600">
          Not a brand?{' '}
          <Link href="/signup/user" className="text-blue-600 hover:underline">
            Sign up as a user instead
          </Link>
        </p>
      </PageContainer>
    </div>
  );
}
