import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { PasswordInput } from '@components/form-fields';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

const ResetToken: React.FC = () => {
  const router = useRouter();
  const { token } = router.query as { token?: string };
  type ResetForm = { password: string };
  const { register, handleSubmit } = useForm<ResetForm>();
  const [message, setMessage] = useState<string>('');

  const submit: SubmitHandler<ResetForm> = async ({ password }) => {
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
    <div className="max-w-sm mx-auto text-center">
      <Head>
        <title>{getPageTitle('Set New Password')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Set New Password</h1>
      <form onSubmit={handleSubmit(submit)} className="space-y-2">
        <PasswordInput
          className="w-full"
          placeholder="New Password"
          register={register}
          name="password"
          rules={{ required: true }}
        />
        <button className="btn btn-primary w-full" type="submit">
          Reset Password
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
  );
};

export default ResetToken;
