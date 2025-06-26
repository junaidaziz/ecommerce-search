import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { TextInput } from '../components/UI/form-fields';
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
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Reset Password')}</title>
      </Head>

      <div className="max-w-sm mx-auto border border-gray-200 rounded-lg shadow-sm p-6 bg-white w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
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
        <p className="text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="link">
            Login
          </Link>
        </p>
        {message && <p className="mt-2">{message}</p>}
      </div>
    </div>
  );
};

export default RequestReset;
