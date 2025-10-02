import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { apiFetch } from '@lib/api';
import { AuthCard } from '@components/Auth';

export default function BrandConfirmation() {
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  const handleResend = async () => {
    setResending(true);
    setResendMessage('');
    setResendError('');
    
    try {
      // TODO: Implement resend verification email endpoint
      const res = await apiFetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (res.ok) {
        setResendMessage('Verification email resent successfully!');
      } else {
        setResendError('Failed to resend verification email. Please try again.');
      }
    } catch (error) {
      setResendError('Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Head>
        <title>{getPageTitle('Email Confirmation')}</title>
      </Head>
      <AuthCard
        icon={
          <svg 
            className="w-16 h-16 text-purple-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
        }
        title="Check Your Email"
        subtitle="We've sent you a verification email"
        iconBgClass="bg-purple-100"
      >
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-gray-700 dark:text-gray-300">
              Please check your email inbox for a confirmation link to activate your brand account.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t forget to check your spam folder if you don&apos;t see it in your inbox.
            </p>
          </div>

          {resendMessage && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200 text-center">
                {resendMessage}
              </p>
            </div>
          )}

          {resendError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200 text-center">
                {resendError}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              {resending ? 'Resending...' : 'Resend Verification Email'}
            </button>
            
            <button
              onClick={() => router.push('/login')}
              className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Go to Login
            </button>
          </div>
        </div>
      </AuthCard>
    </>
  );
}
