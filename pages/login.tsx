import { useState, useContext, useEffect } from 'react';
import { useFormState } from 'react-use-form-state';
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

  const [formState, inputs] = useFormState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      if (user.role === 'brand') router.push('/brand/dashboard');
      else if (user.role === 'super-admin') router.push('/admin');
      else router.push('/user/dashboard');
    }
  }, [user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = formState.values;
    const errors: Record<string, string> = {};
    if (!email) errors.email = 'Email is required';
    else if (!emailRegex.test(email)) errors.email = 'Invalid email format';
    if (!password) errors.password = 'Password is required';
    Object.entries(errors).forEach(([k, v]) => formState.setFieldError(k, v));
    if (Object.keys(errors).length > 0) return;
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
        <form onSubmit={onSubmit} className="space-y-2">
          <EmailInput
            field={inputs.email('email', { validate: (v) =>
              v && !emailRegex.test(v) ? 'Invalid email format' : true })}
            placeholder="Email"
            required
            error={formState.errors.email as string}
          />
          <PasswordInput
            field={inputs.password('password')}
            placeholder="Password"
            required
            error={formState.errors.password as string}
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
