import { apiFetch } from '@lib/api';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { PasswordInput } from '@components/form-fields';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import PageContainer from '@components/Layout/PageContainer';

const ResetToken: React.FC = () => {
  const router = useRouter();
  const { token } = router.query as { token?: string };
  type ResetForm = { password: string; confirmPassword: string };
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>();
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const password = watch('password');

  const submit: SubmitHandler<ResetForm> = async ({ password }) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await apiFetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setMessage('Your password has been successfully reset. You can now login with your new password.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (_) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Head>
          <title>{getPageTitle('Invalid Reset Link')}</title>
        </Head>
        <PageContainer>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Invalid Reset Link</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link href="/auth/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Request a new reset link
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center overflow-auto px-4 py-6 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Set New Password')}</title>
      </Head>
      <PageContainer>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Set New Password</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please enter your new password below.
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">Password Reset Successful!</h3>
                <p className="text-sm text-green-800 dark:text-green-400 mb-3">{message}</p>
                <p className="text-sm text-green-700 dark:text-green-500">Redirecting to login page...</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <PasswordInput
              className="w-full"
              placeholder="New Password"
              register={register}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain uppercase, lowercase, and number',
                },
              }}
              error={errors.password?.message as string}
            />

            <PasswordInput
              className="w-full"
              placeholder="Confirm New Password"
              register={register}
              name="confirmPassword"
              rules={{
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              }}
              error={errors.confirmPassword?.message as string}
            />

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Password Requirements:
              </h3>
              <ul className="space-y-1 text-blue-800 dark:text-blue-400">
                <li className="flex items-start">
                  <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  At least 8 characters long
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Contains uppercase and lowercase letters
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Contains at least one number
                </li>
              </ul>
            </div>

            <button 
              className="btn btn-primary w-full py-3 text-base font-medium" 
              type="submit"
              disabled={loading}
            >
              {loading && <span className="loading loading-spinner mr-2" />}
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Back to Login
            </Link>
          </p>
        </div>
      </PageContainer>
    </div>
  );
};

export default ResetToken;
