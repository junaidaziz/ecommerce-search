import React, { useState, useContext, useEffect } from 'react';
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';
import { AppContext } from '@contexts/AppContext';
import type { AppContextValue } from '../types';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { EmailInput, PasswordInput } from '@components/form-fields';
import GoogleIcon from '@components/icons/GoogleIcon';
import FacebookIcon from '@components/icons/FacebookIcon';
import { User, USER_ROLES } from '../types';
import Button from '@components/UI/Button';
import SocialButton from '@components/UI/SocialButton';
import UserIcon from '@components/icons/UserIcon';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LoginFormInputs {
  email: string;
  password: string;
}

export interface LoginProps {
  // Optionally accept a callback after login, or other props as needed
  onLoginSuccess?: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const router = useRouter();
  const appContext = useContext<AppContextValue | undefined>(AppContext);
  const { login, user } = appContext ?? {};
  const [formError, setFormError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  useEffect(() => {
    if (user) {
      if (onLoginSuccess) onLoginSuccess(user);
      if (user.role === USER_ROLES.BRAND) {
        if (!user.brandName) router.push('/brand/profile?complete=1');
        else router.push('/brand/dashboard');
      } else if (user.role === USER_ROLES.SUPER_ADMIN) {
        router.push('/admin');
      } else {
        if (!user.lastName) router.push('/user/profile?complete=1');
        else router.push('/');
      }
    }
  }, [user, router, onLoginSuccess]);

  const onSubmit: SubmitHandler<LoginFormInputs> = async ({
    email,
    password,
  }) => {
    if (!login) return;
    try {
      setLoading(true);
      await login(email, password);
    } catch (e) {
      setFormError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-8 px-4 animate-fade-in">
      <Head>
        <title>{getPageTitle('Login')}</title>
      </Head>
      
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 sm:p-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-3">
            <UserIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-300 text-center text-base">Sign in to your account to continue.</p>
        </div>

        {/* Social login buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <SocialButton
            icon={<GoogleIcon className="h-5 w-5" />}
            provider="Google"
            onClick={() => {
              document.cookie = 'signupRole=; path=/; Max-Age=0';
              signIn('google');
            }}
          >
            Continue with Google
          </SocialButton>
          <SocialButton
            icon={<FacebookIcon className="h-5 w-5" />}
            provider="Facebook"
            onClick={() => {
              document.cookie = 'signupRole=; path=/; Max-Age=0';
              signIn('facebook');
            }}
          >
            Continue with Facebook
          </SocialButton>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          <span className="mx-4 text-gray-400 dark:text-gray-500 font-medium">or</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        {/* Error message */}
        {formError && <div className="text-red-500 mb-2 text-center font-semibold">{formError}</div>}

        {/* Login form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <EmailInput
              name="email"
              placeholder="Email"
              required
              register={register}
              className={`w-full text-base px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary`}
              rules={{
                required: 'Email is required',
                pattern: { value: emailRegex, message: 'Invalid email format' },
              }}
              error={errors.email?.message as string}
            />
            {errors.email?.message && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <PasswordInput
              name="password"
              placeholder="Password"
              required
              register={register}
              className={`w-full text-base px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary`}
              rules={{ required: 'Password is required' }}
              error={errors.password?.message as string}
            />
            {errors.password?.message && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end mt-1">
            <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary">
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            fullWidth
            rounded
            shadow
            disabled={loading}
            className="mt-2"
          >
            {loading && <span className="loading loading-spinner mr-2"></span>}
            Login
          </Button>
        </form>

        {/* Footer links */}
        <p className="text-center mt-6 text-gray-700 dark:text-gray-300">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary">
            Sign up
          </Link>
        </p>
        <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">
          Want to sign up as a brand?{' '}
          <Link href="/signup/brand" className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary">
            Sign up as a brand
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
