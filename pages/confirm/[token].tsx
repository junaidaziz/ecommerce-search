import { apiFetch } from '@lib/api';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getPageTitle } from '@lib/pageTitle';
import CheckCircleIcon from '@components/icons/CheckCircleIcon';
import XCircleIcon from '@components/icons/XCircleIcon';

export default function Confirm() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    if (!token) return;
    async function verify() {
      try {
        await apiFetch(`/api/verify-email?token=${token}`);
        setStatus('success');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
      }
    }
    verify();
  }, [token, router]);

  return (
    <>
      <Head>
        <title>{getPageTitle('Email Confirmation')}</title>
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 sm:p-10">
          <div className="flex flex-col items-center text-center">
            {status === 'verifying' && (
              <>
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                  Verifying Your Email
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-base">
                  Please wait while we confirm your email address...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                  <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                  Email Verified Successfully!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-base mb-6">
                  Your email has been confirmed. You can now log in to your account.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Redirecting to login page...
                </p>
                <Link 
                  href="/login"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Go to Login
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                  <XCircleIcon className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                  Verification Failed
                </h1>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-red-800 dark:text-red-200 text-base">
                    We couldn't verify your email. The link may be invalid or expired.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Link 
                    href="/signup"
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-center"
                  >
                    Back to Signup
                  </Link>
                  <Link 
                    href="/login"
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-center"
                  >
                    Try Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
