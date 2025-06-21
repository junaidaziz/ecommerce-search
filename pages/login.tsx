import React, { useState, useContext, useEffect } from 'react';
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';
import { AppContext } from '../contexts/AppContext';
import type { AppContextValue } from '../contexts/AppContext';
import { NotificationContext } from '../contexts/NotificationContext';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  EmailInput,
  PasswordInput,
} from '../components/form-fields';
import GoogleIcon from '../components/icons/GoogleIcon';
import GithubIcon from '../components/icons/GithubIcon';
import { User } from '../types';

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
  const { addNotification } = useContext(NotificationContext);
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
      if (user.role === 'brand') router.push('/brand/profile');
      else if (user.role === 'super-admin') router.push('/admin');
      else router.push('/user/profile');
      addNotification('Please complete your profile.', 'info');
    }
  }, [user, router, onLoginSuccess, addNotification]);

  const onSubmit: SubmitHandler<LoginFormInputs> = async ({ email, password }) => {
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
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-sm mx-auto border border-gray-200 rounded-lg shadow-sm p-6 bg-white w-full space-y-4">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <button
          type="button"
          className="btn w-full mb-2 hover:bg-red-600 hover:text-white flex items-center justify-center gap-2"
          onClick={() => signIn('google')}
        >
          <GoogleIcon className="h-5 w-5" />
          Login with Google
        </button>
        <button
          type="button"
          className="btn w-full mb-2 hover:bg-gray-800 hover:text-white flex items-center justify-center gap-2"
          onClick={() => signIn('github')}
        >
          <GithubIcon className="h-5 w-5" />
          Login with GitHub
        </button>
        {formError && <div className="text-red-500 mb-2">{formError}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <EmailInput
            name="email"
            placeholder="Email"
            required
            register={register}
            rules={{
              required: 'Email is required',
              pattern: { value: emailRegex, message: 'Invalid email format' },
            }}
            error={errors.email?.message as string}
          />
          <PasswordInput
            name="password"
            placeholder="Password"
            required
            register={register}
            rules={{ required: 'Password is required' }}
            error={errors.password?.message as string}
          />
          <div className="text-right -mt-2 mb-2">
            <Link href="/auth/forgot-password" className="link text-sm">
              Forgot Password?
            </Link>
          </div>
          <button
            className="btn btn-primary w-full"
            type="submit"
            disabled={loading}
          >
            {loading && <span className="loading loading-spinner mr-2"></span>}
            Login
          </button>
        </form>
        <p className="text-center mt-4">
          Don’t have an account?{' '}
          <Link href="/signup" className="link">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
