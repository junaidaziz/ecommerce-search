import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';

const ResetToken: React.FC = () => {
  const router = useRouter();
  const { token } = router.query as { token?: string };
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (res.ok) setMessage('Password reset');
    else setMessage(data.message || 'Error');
  };

  if (!token) return <div className="p-4">Invalid token</div>;

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Set New Password</h1>
      <form onSubmit={submit} className="space-y-2">
        <input
          className="input input-bordered w-full"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          placeholder="New Password"
        />
        <button className="btn btn-primary w-full" type="submit">
          Reset Password
        </button>
      </form>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default ResetToken;
