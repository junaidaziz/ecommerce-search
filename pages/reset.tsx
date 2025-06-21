import { useState, FormEvent, ChangeEvent } from 'react';
import { TextInput } from '../components/form-fields';
import Head from 'next/head';
import { getPageTitle } from '../lib/pageTitle';

const RequestReset: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch('/api/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) setMessage('Check your email for reset link');
    else setMessage(data.message || 'Error');
  };

  return (
    <div className="max-w-sm mx-auto">
      <Head>
        <title>{getPageTitle('Reset Password')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <form onSubmit={submit} className="space-y-2">
        <TextInput
          name="email"
          className="w-full"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          placeholder="Email"
        />
        <button className="btn btn-primary w-full" type="submit">
          Request Reset
        </button>
      </form>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default RequestReset;
