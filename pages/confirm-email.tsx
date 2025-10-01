import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ConfirmationPage from '@components/Auth/ConfirmationPage';
import { apiFetch } from '@lib/api';

export default function ConfirmEmail() {
  const router = useRouter();
  const { email, token } = router.query;
  const [resending, setResending] = useState(false);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setResending(true);
    try {
      await apiFetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      alert('Confirmation email resent! Please check your inbox.');
    } catch (error) {
      alert('Failed to resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <ConfirmationPage
        email={email as string}
        onResendEmail={handleResendEmail}
        resending={resending}
      />
      
      {/* Development-only: Show direct verification link */}
      {token && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 shadow-lg max-w-sm">
          <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            🧪 Dev Mode Only
          </p>
          <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-3">
            Click below to test email verification:
          </p>
          <Link
            href={`/confirm/${token}`}
            className="block w-full text-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Test Verification Link
          </Link>
        </div>
      )}
    </>
  );
}
