import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppContext } from '@contexts/AppContext';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import UserIcon from '@components/icons/UserIcon';
import { PasswordInput } from '@components/form-fields';
import useEmailAvailability from '@hooks/useEmailAvailability';
import { USER_ROLES } from '@/types';
import { AuthCard, AuthInput, AuthButton, AuthSocialLogin, AuthDivider, FormError, AuthMessage } from '@components/Auth';
import {
  AUTH_PLACEHOLDERS,
  AUTH_ERRORS,
  AUTH_TITLES,
  AUTH_BUTTONS,
  AUTH_LINKS,
  AUTH_INFO,
  PASSWORD_REGEX,
  getEmailValidation,
  getFirstNameValidation,
} from '@/config/auth.config';

export default function UserSignup() {
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
  }>({ mode: 'onBlur' });
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
        message: AUTH_ERRORS.passwordsNoMatch,
      });
      return AUTH_ERRORS.passwordsNoMatch;
    }
    clearErrors('confirm');
    return true;
  };

  const submit = async (values: any) => {
    try {
      const data = await signup<{ token: string }>('/api/signup/user', {
        firstName: values.firstName,
        email: values.email,
        password: values.password,
      });
      
      // On local dev: redirect to /confirm-email?token=xxx for testing
      // On staging/production: redirect to /confirm-email with email
      const isLocalDev = process.env.NODE_ENV === 'development';
      
      if (isLocalDev) {
        router.push(`/confirm-email?token=${data.token}&email=${encodeURIComponent(values.email)}`);
      } else {
        router.push(`/confirm-email?email=${encodeURIComponent(values.email)}`);
      }
    } catch (e) {
      setFormError(AUTH_ERRORS.signupFailed);
    }
  };

  const passwordValue = watch('password');
  const showPasswordHint =
    passwordFocused ||
    (passwordValue !== '' && !PASSWORD_REGEX.test(passwordValue));

  return (
    <>
      <Head>
        <title>{getPageTitle('User Signup')}</title>
      </Head>
      <AuthCard
        icon={<UserIcon className="w-8 h-8 text-blue-600" />}
        title={AUTH_TITLES.userSignup.title}
        subtitle={AUTH_TITLES.userSignup.subtitle}
        iconBgClass="bg-blue-100"
      >
        <AuthSocialLogin role="USER" />
        <AuthDivider />
        
        <FormError message={formError} align="left" className="mb-4" />
        
        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <AuthInput
            type="text"
            name="firstName"
            placeholder={AUTH_PLACEHOLDERS.firstName}
            register={register}
            rules={getFirstNameValidation()}
            error={errors.firstName?.message as string}
          />
          
          <AuthInput
            type="email"
            name="email"
            placeholder={AUTH_PLACEHOLDERS.email}
            register={register}
            onBlur={handleEmailBlur}
            rules={getEmailValidation()}
            error={errors.email?.message as string}
          />
          
          <div className="space-y-2">
            <div>
              <PasswordInput
                name="password"
                placeholder={AUTH_PLACEHOLDERS.password}
                register={register}
                rules={{
                  required: AUTH_ERRORS.passwordRequired,
                  pattern: {
                    value: PASSWORD_REGEX,
                    message: AUTH_ERRORS.passwordInvalid,
                  },
                  onBlur: handlePasswordBlur,
                }}
                onFocus={handlePasswordFocus}
                error={errors.password?.message as string}
                className={`w-full text-base px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary`}
              />
              {errors.password?.message && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <PasswordInput
                name="confirm"
                placeholder={AUTH_PLACEHOLDERS.confirmPassword}
                register={register}
                rules={{ validate: handleConfirmBlur }}
                error={errors.confirm?.message as string}
                className={`w-full text-base px-4 py-3 rounded-lg border ${errors.confirm ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary`}
              />
              {errors.confirm?.message && <p className="text-red-500 text-sm mt-1">{errors.confirm.message}</p>}
            </div>
          </div>
          
          {showPasswordHint && (
            <AuthMessage message={AUTH_INFO.passwordHint} type="info" />
          )}
          
          <AuthButton loading={checkingEmail} disabled={checkingEmail || !!errors.email}>
            {AUTH_BUTTONS.signup}
          </AuthButton>
        </form>
        
        <p className="text-center mt-6 text-gray-700 dark:text-gray-300">
          {AUTH_LINKS.haveAccount}{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary">
            {AUTH_LINKS.loginLink}
          </Link>
        </p>
        <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">
          {AUTH_LINKS.userSignupPrompt}{' '}
          <Link href="/signup/brand" className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary">
            {AUTH_LINKS.brandSignupLink}
          </Link>
        </p>
      </AuthCard>
    </>
  );
}
