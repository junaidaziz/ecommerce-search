import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Confirm() {
  const router = useRouter();
  const { token } = router.query;
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!token) return;
    async function verify() {
      const res = await fetch(`/api/verify-email?token=${token}`);
      if (res.ok) {
        setMessage('Email verified');
      } else {
        setMessage('Verification failed');
      }
    }
    verify();
  }, [token]);
  return <div className="p-4">{message || 'Verifying...'}</div>;
}
