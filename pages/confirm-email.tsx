import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
    <ConfirmationPage
      email={email as string}
      onResendEmail={handleResendEmail}
      resending={resending}
    />
  );
}
