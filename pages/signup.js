import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AppContext } from '../contexts/AppContext';
import { signIn } from 'next-auth/react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function Signup() {
  const router = useRouter();
  const { signup } = useContext(AppContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [brand, setBrand] = useState('');
  const [gender, setGender] = useState('');
  const [role, setRole] = useState('customer');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const handleEmailBlur = async () => {
    setErrors(prev => {
      const next = { ...prev };
      if (email && !emailRegex.test(email)) {
        next.email = 'Invalid email format';
      } else if (next.email === 'Invalid email format' || next.email === 'Email already registered') {
        delete next.email;
      }
      return next;
    });
    if (email && emailRegex.test(email)) {
      try {
        const res = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setErrors(prev => ({ ...prev, email: 'Email already registered' }));
          }
        }
      } catch (_) {
        // ignore network errors
      }
    }
  };

  const handlePasswordBlur = () => {
    setErrors(prev => {
      const next = { ...prev };
      if (password && !passwordRegex.test(password)) {
        next.password =
          'Password must be at least 8 characters and include uppercase, lowercase, number and special character';
      } else if (next.password && next.password.startsWith('Password must')) {
        delete next.password;
      }
      if (confirm && password !== confirm) {
        next.confirm = 'Passwords do not match';
      } else if (next.confirm === 'Passwords do not match') {
        delete next.confirm;
      }
      return next;
    });
  };

  const handleConfirmBlur = () => {
    setErrors(prev => {
      const next = { ...prev };
      if (password && confirm && password !== confirm) {
        next.confirm = 'Passwords do not match';
      } else if (next.confirm === 'Passwords do not match') {
        delete next.confirm;
      }
      return next;
    });
  };

  const submit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (!confirm) newErrors.confirm = 'Confirm password is required';
    if (!gender) newErrors.gender = 'Gender is required';
    if (role === 'vendor' && !brand) newErrors.brand = 'Brand name is required';
    if (password && confirm && password !== confirm) {
      newErrors.confirm = 'Passwords do not match';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const data = await signup({
        firstName,
        lastName,
        email,
        password,
        brandName: brand,
        gender,
        role
      });
      router.push(`/confirm/${data.token}`);
    } catch (e) {
      setFormError('Signup failed');
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
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
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
        Sign up with Google
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
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
        Sign up with GitHub
      </button>
      {formError && <div className="text-red-500 mb-2">{formError}</div>}
      <form onSubmit={submit} className="space-y-2">
        <div>
          <input
            className={`input input-bordered w-full ${errors.firstName ? 'border-red-500' : ''}`}
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="First Name"
          />
          {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
        </div>
        <div>
          <input
            className={`input input-bordered w-full ${errors.lastName ? 'border-red-500' : ''}`}
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Last Name"
          />
          {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
        </div>
        <div>
          <input
            className={`input input-bordered w-full ${errors.email ? 'border-red-500' : ''}`}
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            placeholder="Email"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className={`input input-bordered w-full pr-10 ${errors.password ? 'border-red-500' : ''}`}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={handlePasswordBlur}
            placeholder="Password"
          />
          <button
            type="button"
            className="absolute right-2 top-2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.965 9.965 0 012.652-4.304m3.821-2.338A9.953 9.953 0 0112 5c4.478 0 8.269 2.943 9.543 7a9.952 9.952 0 01-.46 1.08M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1.259 4.75L5.21 5.21" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          <p className="text-sm text-gray-500">
            Password must be at least 8 characters and include uppercase,
            lowercase, number and special character
          </p>
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            className={`input input-bordered w-full pr-10 ${errors.confirm ? 'border-red-500' : ''}`}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onBlur={handleConfirmBlur}
            placeholder="Confirm Password"
          />
          <button
            type="button"
            className="absolute right-2 top-2"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.965 9.965 0 012.652-4.304m3.821-2.338A9.953 9.953 0 0112 5c4.478 0 8.269 2.943 9.543 7a9.952 9.952 0 01-.46 1.08M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1.259 4.75L5.21 5.21" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          {errors.confirm && <p className="text-red-500 text-sm">{errors.confirm}</p>}
        </div>
        <div>
          <select
            className="select select-bordered w-full"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
          </select>
        </div>
        {role === 'vendor' && (
          <div>
            <input
              className={`input input-bordered w-full ${errors.brand ? 'border-red-500' : ''}`}
              value={brand}
              onChange={e => setBrand(e.target.value)}
              placeholder="Brand Name"
            />
            {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
          </div>
        )}
        <div>
          <select
            className={`select select-bordered w-full ${errors.gender ? 'border-red-500' : ''}`}
            value={gender}
            onChange={e => setGender(e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
        </div>
        <button className="btn btn-primary w-full" type="submit">Sign Up</button>
      </form>
    </div>
  );
}

