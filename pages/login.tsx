import { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AppContext } from '../contexts/AppContext';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  EmailInput,
  PasswordInput,
} from '../components/form-fields';
import GoogleIcon from '../components/icons/GoogleIcon';
import GithubIcon from '../components/icons/GithubIcon';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const router = useRouter();
  const { login, user } = useContext(AppContext)!;
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>();

  useEffect(() => {
    if (user) {
      if (user.role === 'brand') router.push('/brand/dashboard');
      else if (user.role === 'super-admin') router.push('/admin');
      else router.push('/user/dashboard');
    }
  }, [user, router]);

  const onSubmit = async ({ email, password }: { email: string; password: string }) => {
    try {
      setLoading(true);
      await login(email, password);
    } catch (e) {
      setFormError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto mt-10 border border-gray-200 rounded-lg shadow-sm p-6 bg-white w-full space-y-4">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <button
          type="button"
          className="btn w-full mb-2 hover:bg-red-600 hover:text-white flex items-center justify-center gap-2"
          onClick={() => signIn('google')}
        >
          <GoogleIcon className="h-5 w-5" />
          Login with Google
        </button>
        <button
          type="button"
          className="btn w-full mb-2 hover:bg-gray-800 hover:text-white flex items-center justify-center gap-2"
          onClick={() => signIn('github')}
        >
          <GithubIcon className="h-5 w-5" />
          Login with GitHub
        </button>
        {formError && <div className="text-red-500 mb-2">{formError}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <EmailInput
            name="email"
            placeholder="Email"
            required
            register={register}
            rules={{
              required: 'Email is required',
              pattern: { value: emailRegex, message: 'Invalid email format' },
            }}
            error={errors.email?.message as string}
          />
          <PasswordInput
            name="password"
            placeholder="Password"
            required
            register={register}
            rules={{ required: 'Password is required' }}
            error={errors.password?.message as string}
          />
          <button
            className="btn btn-primary w-full"
            type="submit"
            disabled={loading}
          >
            {loading && <span className="loading loading-spinner mr-2"></span>}
            Login
          </button>
        </form>
        <p className="text-center mt-4">
          Don’t have an account?{' '}
          <Link href="/signup" className="link">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}
