import { apiFetch } from '@lib/api';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getPageTitle } from '@lib/pageTitle';
import ConfirmationPage from '@components/pages/ConfirmationPage';

export default function Confirm() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    async function verify() {
      try {
        await apiFetch(`/api/verify-email?token=${token}`);
        setStatus('success');
      } catch (error) {
        setStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'Verification failed. The link may be invalid or expired.';
        setErrorMessage(errorMessage);
      }
    }
    verify();
  }, [token]);

  const handleResend = async () => {
    setResending(true);
    try {
      // TODO: Implement resend functionality when the API endpoint is available
      // For now, just redirect to signup or show a message
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Please contact support or try signing up again to receive a new verification email.');
    } catch (error) {
      alert('Failed to resend verification email. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Head>
        <title>{getPageTitle('Email Confirmation')}</title>
      </Head>
      <ConfirmationPage
        status={status}
        errorMessage={errorMessage}
        onResend={handleResend}
        resending={resending}
      />
    </>
  );
}
