import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { EmailInput, PasswordInput } from '../components/form-fields';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const router = useRouter();
  const { login, user } = useContext(AppContext)!;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'brand') router.push('/brand/dashboard');
      else if (user.role === 'super-admin') router.push('/admin');
      else router.push('/user/dashboard');
    }
  }, [user, router]);

  const handleEmailBlur = () => {
    setErrors((prev) => {
      const next = { ...prev };
      if (email && !emailRegex.test(email)) {
        next.email = 'Invalid email format';
      } else if (next.email === 'Invalid email format') {
        delete next.email;
      }
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5"
          >
            <path
              fill="currentColor"
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            />
          </svg>
          Login with Google
        </button>
        <button
          type="button"
          className="btn w-full mb-2 hover:bg-gray-800 hover:text-white flex items-center justify-center gap-2"
          onClick={() => signIn('github')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5"
          >
            <path
              fill="currentColor"
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            />
          </svg>
          Login with GitHub
        </button>
        {formError && <div className="text-red-500 mb-2">{formError}</div>}
        <form onSubmit={submit} className="space-y-2">
          <EmailInput
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            error={errors.email as string}
          />
          <PasswordInput
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password as string}
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
