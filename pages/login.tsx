import { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppContext } from '../contexts/AppContext';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import InputField from '../components/ui/InputField';
import GoogleIcon from '../components/icons/GoogleIcon';
import GithubIcon from '../components/icons/GithubIcon';
import EyeIcon from '../components/icons/EyeIcon';
import EyeOffIcon from '../components/icons/EyeOffIcon';

const schema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});
type LoginFormValues = z.infer<typeof schema>;

export default function Login() {
  const router = useRouter();
  const { login, user } = useContext(AppContext)!;
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) {
      if (user.role === 'brand') router.push('/brand/dashboard');
      else if (user.role === 'super-admin') router.push('/admin');
      else router.push('/user/dashboard');
    }
  }, [user, router]);

  const onSubmit = async ({ email, password }: LoginFormValues) => {
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
          <InputField
            type="email"
            placeholder="Email"
            {...register('email')}
            error={errors.email?.message as string}
          />
          <div className="relative">
            <InputField
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="pr-10"
              {...register('password')}
              error={errors.password?.message as string}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2"
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
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
