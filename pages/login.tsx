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
import PageContainer from '@components/Layout/PageContainer';
import Button from '@components/UI/Button';

// SocialLoginButton component
const SocialLoginButton: React.FC<{
  icon: React.ReactNode;
  provider: string;
  onClick: () => void;
  className?: string;
}> = ({ icon, provider, onClick, className }) => (
  <Button
    type="button"
    onClick={onClick}
    variant="outline"
    size="md"
    fullWidth
    rounded
    className={`flex items-center justify-center gap-3 font-semibold text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${className}`}
  >
    {icon}
    <span>Login with {provider}</span>
  </Button>
);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8 animate-fade-in">
      <Head>
        <title>{getPageTitle('Login')}</title>
      </Head>
      <PageContainer className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 md:p-10 space-y-6">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6">Login</h1>
        <div className="flex flex-col gap-4 mb-6">
          <SocialLoginButton
            icon={<GoogleIcon className="h-5 w-5" />}
            provider="Google"
            onClick={() => {
              document.cookie = 'signupRole=; path=/; Max-Age=0';
              signIn('google');
            }}
            className="border-red-500 hover:border-red-600"
          />
          <SocialLoginButton
            icon={<FacebookIcon className="h-5 w-5" />}
            provider="Facebook"
            onClick={() => {
              document.cookie = 'signupRole=; path=/; Max-Age=0';
              signIn('facebook');
            }}
            className="border-blue-600 hover:border-blue-700"
          />
        </div>
        {formError && <div className="text-red-500 mb-2 text-center font-semibold">{formError}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <EmailInput
            name="email"
            placeholder="Email"
            required
            register={register}
            className="w-full text-base px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
            rules={{
              required: 'Email is required',
              pattern: { value: emailRegex, message: 'Invalid email format' },
            }}
            error={errors.email?.message as string}
          />
          <div className="relative">
            <PasswordInput
              name="password"
              placeholder="Password"
              required
              register={register}
              className="w-full text-base px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              rules={{ required: 'Password is required' }}
              error={errors.password?.message as string}
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-4">
              {/* Password visibility toggle is handled inside PasswordInput */}
            </div>
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
        <p className="text-center mt-4 text-base text-gray-700 dark:text-gray-300">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary">
            Signup
          </Link>
        </p>
      </PageContainer>
    </div>
  );
};

export default Login;
