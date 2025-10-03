import React, { useState, useContext, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppContext } from '@contexts/AppContext';
import type { AppContextValue } from '../types';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { User, USER_ROLES } from '../types';
import UserIcon from '@components/icons/UserIcon';
import { AuthCard, AuthInput, AuthButton, AuthSocialLogin, AuthDivider, FormError } from '@components/Auth';
import { 
  AUTH_PLACEHOLDERS, 
  AUTH_ERRORS, 
  AUTH_TITLES, 
  AUTH_BUTTONS, 
  AUTH_LINKS,
} from '@/config/auth.config';
import { loginSchema, type LoginFormData } from '@lib/validation';

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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (user) {
      if (onLoginSuccess) onLoginSuccess(user);
      if (user.role === USER_ROLES.BRAND) {
        if (!user.brandName) router.replace('/brand/profile?complete=1');
        else router.replace('/brand/dashboard');
      } else if (user.role === USER_ROLES.SUPER_ADMIN) {
        router.replace('/admin');
      } else {
        if (!user.lastName) router.replace('/user/profile?complete=1');
        else router.replace('/');
      }
    }
  }, [user, router, onLoginSuccess]);

  const onSubmit: SubmitHandler<LoginFormData> = async ({
    email,
    password,
  }) => {
    if (!login) return;
    try {
      setLoading(true);
      await login(email, password);
    } catch (e) {
      setFormError(AUTH_ERRORS.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{getPageTitle('Login')}</title>
      </Head>
      {user ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
          </div>
        </div>
      ) : (
        <AuthCard
          icon={<UserIcon className="w-8 h-8 text-blue-600" />}
          title={AUTH_TITLES.login.title}
          subtitle={AUTH_TITLES.login.subtitle}
          iconBgClass="bg-blue-100"
        >
          <AuthSocialLogin />
          <AuthDivider />
          
          <FormError message={formError} align="left" className="mb-4" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AuthInput
              type="email"
              name="email"
              placeholder={AUTH_PLACEHOLDERS.email}
              register={register}
              error={errors.email?.message as string}
            />

            <AuthInput
              type="password"
              name="password"
              placeholder={AUTH_PLACEHOLDERS.password}
              register={register}
              error={errors.password?.message as string}
            />

            <div className="flex justify-end mt-1">
              <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary">
                {AUTH_BUTTONS.forgotPassword}
              </Link>
            </div>

            <AuthButton loading={loading}>
              {AUTH_BUTTONS.login}
            </AuthButton>
          </form>

          <p className="text-center mt-6 text-gray-700 dark:text-gray-300">
            {AUTH_LINKS.noAccount}{' '}
            <Link href="/signup" className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary">
              {AUTH_LINKS.signupLink}
            </Link>
          </p>
          <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">
            {AUTH_LINKS.brandSignupPrompt}{' '}
            <Link href="/signup/brand" className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary">
              {AUTH_LINKS.brandSignupLink}
            </Link>
          </p>
        </AuthCard>
      )}
    </>
  );
};

export default Login;
