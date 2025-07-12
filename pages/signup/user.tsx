import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppContext } from '@contexts/AppContext';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import UserIcon from '@components/icons/UserIcon';
import GoogleIcon from '@components/icons/GoogleIcon';
import FacebookIcon from '@components/icons/FacebookIcon';
import {
  EmailInput,
  PasswordInput,
  TextInput,
} from '@components/form-fields';
import useEmailAvailability from '@hooks/useEmailAvailability';
import { USER_ROLES } from '@/types';
import Button from '@components/UI/Button';
import SocialButton from '@components/UI/SocialButton';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

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
      const data = await signup<{ token: string }>('/api/signup/user', {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-8 px-4 animate-fade-in">
      <Head>
        <title>{getPageTitle('User Signup')}</title>
      </Head>
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 sm:p-10 relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-3">
            <UserIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Create Your Account</h1>
          <p className="text-gray-500 dark:text-gray-300 text-center text-base">Sign up to shop, track orders, and enjoy exclusive benefits.</p>
        </div>
        <div className="flex flex-col gap-3 mb-6">
          <SocialButton
            icon={<GoogleIcon className="h-5 w-5" />}
            provider="Google"
            onClick={() => {
              document.cookie = 'signupRole=USER; path=/';
              signIn('google');
            }}
          >
            Continue with Google
          </SocialButton>
          <SocialButton
            icon={<FacebookIcon className="h-5 w-5" />}
            provider="Facebook"
            onClick={() => {
              document.cookie = 'signupRole=USER; path=/';
              signIn('facebook');
            }}
          >
            Continue with Facebook
          </SocialButton>
        </div>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          <span className="mx-4 text-gray-400 dark:text-gray-500 font-medium">or</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        {formError && <div className="text-red-500 mb-2 text-center font-semibold">{formError}</div>}
        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <TextInput
            name="firstName"
            placeholder="First Name"
            register={register}
            rules={{ required: 'First name is required' }}
            error={errors.firstName?.message as string}
            className={`w-full text-base px-4 py-3 rounded-lg border ${errors.firstName ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary`}
          />
          {errors.firstName?.message && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
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
            className={`w-full text-base px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary`}
          />
          {errors.email?.message && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
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
              className={`w-full text-base px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary`}
            />
            {errors.password?.message && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
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
          {showPasswordHint && (
            <p id="password-help" className="text-sm text-gray-500 dark:text-gray-400">
              Password must be at least 8 characters and include uppercase,
              lowercase, number and special character
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            fullWidth
            rounded
            shadow
            disabled={checkingEmail || !!errors.email}
            className="mt-2"
          >
            {checkingEmail && (
              <span className="loading loading-spinner mr-2"></span>
            )}
            Sign Up
          </Button>
        </form>
        <p className="text-center mt-6 text-gray-700 dark:text-gray-300">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary">
            Login
          </Link>
        </p>
        <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">
          Want to sign up as a brand instead?{' '}
          <Link href="/signup/brand" className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary">
            Sign up as a brand
          </Link>
        </p>
      </div>
    </div>
  );
}
