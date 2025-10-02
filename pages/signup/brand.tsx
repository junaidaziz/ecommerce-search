import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppContext } from '@contexts/AppContext';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import BuildingIcon from '@components/icons/BuildingIcon';
import { PasswordInput } from '@components/form-fields';
import useEmailAvailability from '@hooks/useEmailAvailability';
import useBrandNameAvailability from '@hooks/useBrandNameAvailability';
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
  getBrandNameValidation,
} from '@/config/auth.config';

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
    brandName: string;
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

  const { checkingBrandName, handleBrandNameBlur } = useBrandNameAvailability(
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
      const data = await signup<{ token: string; autoConfirmed?: boolean }>('/api/signup/brand', {
        firstName: values.brandName,
        email: values.email,
        password: values.password,
      });
      
      // If auto-confirmed (local dev), redirect to brand dashboard
      if (data.autoConfirmed) {
        router.push('/brand/profile?complete=1');
      } else {
        // Production: redirect to confirmation page
        router.push('/brand/confirmation');
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
        <title>{getPageTitle('Brand Signup')}</title>
      </Head>
      <AuthCard
        icon={<BuildingIcon className="w-8 h-8 text-purple-600" />}
        title={AUTH_TITLES.brandSignup.title}
        subtitle={AUTH_TITLES.brandSignup.subtitle}
        iconBgClass="bg-purple-100"
      >
        <AuthSocialLogin role="BRAND" />
        <AuthDivider />
        
        <FormError message={formError} align="left" className="mb-4" />
        
        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <AuthInput
            type="text"
            name="brandName"
            placeholder={AUTH_PLACEHOLDERS.brandName}
            register={register}
            onBlur={handleBrandNameBlur}
            rules={getBrandNameValidation()}
            error={errors.brandName?.message as string}
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
            <PasswordInput
              name="confirm"
              placeholder={AUTH_PLACEHOLDERS.confirmPassword}
              register={register}
              rules={{ validate: handleConfirmBlur }}
              error={errors.confirm?.message as string}
              className={`w-full text-base px-4 py-3 rounded-lg border ${errors.confirm ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary`}
            />
          </div>
          
          {showPasswordHint && (
            <AuthMessage message={AUTH_INFO.passwordHint} type="info" />
          )}
          
          <AuthButton loading={checkingEmail || checkingBrandName} disabled={checkingEmail || checkingBrandName || !!errors.email || !!errors.brandName}>
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
          {AUTH_LINKS.notBrand}{' '}
          <Link href="/signup/user" className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary">
            {AUTH_LINKS.userSignupLink}
          </Link>
        </p>
      </AuthCard>
    </>
  );
}
