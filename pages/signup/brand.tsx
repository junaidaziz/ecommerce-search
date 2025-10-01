import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppContext } from '@contexts/AppContext';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import BuildingIcon from '@components/icons/BuildingIcon';
import { PasswordInput, TextInput } from '@components/form-fields';
import useEmailAvailability from '@hooks/useEmailAvailability';
import { USER_ROLES } from '@/types';
import { AuthCard, AuthInput, AuthButton, AuthSocialLogin, AuthDivider } from '@components/Auth';

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
        firstName: values.brandName,
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
    <>
      <Head>
        <title>{getPageTitle('Brand Signup')}</title>
      </Head>
      <AuthCard
        icon={<BuildingIcon className="w-8 h-8 text-purple-600" />}
        title="Create Your Brand Account"
        subtitle="Sign up to start selling, manage your store, and grow your business."
        iconBgClass="bg-purple-100"
      >
        <AuthSocialLogin role="BRAND" />
        <AuthDivider />
        
        {formError && <div className="text-red-500 mb-2 text-center font-semibold">{formError}</div>}
        
        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <AuthInput
            type="text"
            name="brandName"
            placeholder="Brand Name"
            register={register}
            rules={{ required: 'Brand name is required' }}
            error={errors.brandName?.message as string}
          />
          
          <AuthInput
            type="email"
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
            <div>
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
                className={`w-full text-base px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary`}
              />
              {errors.password?.message && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <PasswordInput
                name="confirm"
                placeholder="Confirm Password"
                register={register}
                rules={{ validate: handleConfirmBlur }}
                error={errors.confirm?.message as string}
                className={`w-full text-base px-4 py-3 rounded-lg border ${errors.confirm ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary`}
              />
              {errors.confirm?.message && <p className="text-red-500 text-sm mt-1">{errors.confirm.message}</p>}
            </div>
          </div>
          
          {showPasswordHint && (
            <p id="password-help" className="text-sm text-gray-500 dark:text-gray-400">
              Password must be at least 8 characters and include uppercase,
              lowercase, number and special character
            </p>
          )}
          
          <AuthButton loading={checkingEmail} disabled={checkingEmail || !!errors.email}>
            Sign Up
          </AuthButton>
        </form>
        
        <p className="text-center mt-6 text-gray-700 dark:text-gray-300">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary">
            Login
          </Link>
        </p>
        <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">
          Not a brand?{' '}
          <Link href="/signup/user" className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary">
            Sign up as a user
          </Link>
        </p>
      </AuthCard>
    </>
  );
}
