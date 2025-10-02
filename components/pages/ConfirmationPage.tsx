import React from 'react';
import Link from 'next/link';
import EnvelopeIcon from '@components/icons/EnvelopeIcon';
import CheckCircleIcon from '@components/icons/CheckCircleIcon';
import XCircleIcon from '@components/icons/XCircleIcon';
import Button from '@components/UI/Button';

interface ConfirmationPageProps {
  status: 'verifying' | 'success' | 'error';
  errorMessage?: string;
  onResend?: () => void;
  resending?: boolean;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  status,
  errorMessage,
  onResend,
  resending = false,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-8 px-4 animate-fade-in">
      <div className="w-full max-w-md">
        {status === 'verifying' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 sm:p-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4 animate-pulse">
                <EnvelopeIcon size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                Verifying...
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Please wait while we verify your email.
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 sm:p-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <CheckCircleIcon size={32} className="text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                Email Verified!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Your email has been successfully verified. You can now access all features.
              </p>
              <div className="w-full">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  rounded
                  shadow
                  onClick={() => window.location.href = '/login'}
                >
                  Continue to Login
                </Button>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 sm:p-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <XCircleIcon size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h1>
              <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-800 dark:text-red-300 text-center text-sm">
                  {errorMessage || 'The verification link is invalid or has expired.'}
                </p>
              </div>
              {onResend && (
                <div className="w-full space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    rounded
                    shadow
                    onClick={onResend}
                    disabled={resending}
                  >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    or{' '}
                    <Link
                      href="/login"
                      className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                      return to login
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmationPage;
