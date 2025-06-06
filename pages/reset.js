import { useState } from 'react';

export default function RequestReset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submit = async e => {
    e.preventDefault();
    const res = await fetch('/api/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) setMessage('Check your email for reset link');
    else setMessage(data.message || 'Error');
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <form onSubmit={submit} className="space-y-2">
        <input className="input input-bordered w-full" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <button className="btn btn-primary w-full" type="submit">Request Reset</button>
      </form>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
