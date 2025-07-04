import { apiFetch } from '@lib/api';
import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { TextInput } from '@components/form-fields';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import PageContainer from '@components/Layout/PageContainer';

const RequestReset: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await apiFetch('/api/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) setMessage('Check your email for reset link');
    else setMessage(data.message || 'Error');
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-auto px-4 py-6 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Reset Password')}</title>
      </Head>

      <PageContainer>
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
      </PageContainer>
    </div>
  );
};

export default RequestReset;
