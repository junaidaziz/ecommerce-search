import { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { signIn } from 'next-auth/react';

export default function Login() {
  const { login } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const submit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await login(email, password);
    } catch (e) {
      setFormError('Invalid credentials');
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <button
        type="button"
        className="btn w-full mb-2"
        onClick={() => signIn('google')}
      >
        Login with Google
      </button>
      <button
        type="button"
        className="btn w-full mb-2"
        onClick={() => signIn('github')}
      >
        Login with GitHub
      </button>
      {formError && <div className="text-red-500 mb-2">{formError}</div>}
      <form onSubmit={submit} className="space-y-2">
        <div>
          <input
            className={`input input-bordered w-full ${errors.email ? 'border-red-500' : ''}`}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div>
          <input
            type="password"
            className={`input input-bordered w-full ${errors.password ? 'border-red-500' : ''}`}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        <button className="btn btn-primary w-full" type="submit">Login</button>
      </form>
    </div>
  );
}

