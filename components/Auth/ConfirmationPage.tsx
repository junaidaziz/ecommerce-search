import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getPageTitle } from '@lib/pageTitle';
import EnvelopeIcon from '@components/icons/EnvelopeIcon';

interface ConfirmationPageProps {
  email?: string;
  onResendEmail?: () => void;
  resending?: boolean;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ 
  email, 
  onResendEmail,
  resending = false 
}) => {
  return (
    <>
      <Head>
        <title>{getPageTitle('Confirm Your Email')}</title>
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 sm:p-10">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
              <EnvelopeIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            
            {/* Title */}
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
              Confirm Your Email
            </h1>
            
            {/* Message */}
            <p className="text-gray-600 dark:text-gray-300 text-base mb-2">
              We&apos;ve sent a confirmation email to:
            </p>
            
            {email && (
              <p className="text-blue-600 dark:text-blue-400 font-semibold mb-6">
                {email}
              </p>
            )}
            
            <p className="text-gray-600 dark:text-gray-300 text-base mb-8">
              Please check your inbox and click the confirmation link to activate your account.
            </p>
            
            {/* Resend Button */}
            {onResendEmail && (
              <div className="w-full mb-6">
                <button
                  onClick={onResendEmail}
                  disabled={resending}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  {resending ? 'Sending...' : 'Resend Confirmation Email'}
                </button>
              </div>
            )}
            
            {/* Additional Info */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              <p>Didn&apos;t receive the email? Check your spam folder.</p>
            </div>
            
            {/* Back to Login */}
            <Link 
              href="/login" 
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationPage;
