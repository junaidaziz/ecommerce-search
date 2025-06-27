import { useState } from 'react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { EmailInput } from '@components/form-fields';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import PageContainer from '@components/Layout/PageContainer';

interface ForgotPasswordForm {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<ForgotPasswordForm> = async ({ email }) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) setMessage('Check your email for reset link');
      else setMessage(data.message || 'Error');
    } catch (_) {
      setMessage('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-auto px-4 py-6 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Forgot Password')}</title>
      </Head>
      <PageContainer>
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <EmailInput
            name="email"
            placeholder="Email"
            register={register}
            required
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format',
              },
            }}
            error={errors.email?.message as string}
            className="w-full"
          />
          <button
            className="btn btn-primary w-full"
            type="submit"
            disabled={loading}
          >
            {loading && <span className="loading loading-spinner mr-2" />}
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

export default ForgotPasswordPage;
