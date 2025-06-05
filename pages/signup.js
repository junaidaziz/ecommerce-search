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
  const [brand, setBrand] = useState('');
  const [gender, setGender] = useState('');
  const [role, setRole] = useState('user');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const handleEmailBlur = () => {
    setErrors(prev => {
      const next = { ...prev };
      if (email && !emailRegex.test(email)) {
        next.email = 'Invalid email format';
      } else if (next.email === 'Invalid email format') {
        delete next.email;
      }
      return next;
    });
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
    if (role === 'brand' && !brand) newErrors.brand = 'Brand name is required';
    if (password && confirm && password !== confirm) {
      newErrors.confirm = 'Passwords do not match';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await signup({
        firstName,
        lastName,
        email,
        password,
        brandName: brand,
        gender,
        role: role === 'brand' ? 'admin' : 'user'
      });
      router.push('/');
    } catch (e) {
      setFormError('Signup failed');
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <button
        type="button"
        className="btn w-full mb-2"
        onClick={() => signIn('google')}
      >
        Sign up with Google
      </button>
      <button
        type="button"
        className="btn w-full mb-2"
        onClick={() => signIn('github')}
      >
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
        <div>
          <input
            type="password"
            className={`input input-bordered w-full ${errors.password ? 'border-red-500' : ''}`}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={handlePasswordBlur}
            placeholder="Password"
          />
          <p className="text-sm text-gray-500">
            Password must be at least 8 characters and include uppercase,
            lowercase, number and special character
          </p>
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        <div>
          <input
            type="password"
            className={`input input-bordered w-full ${errors.confirm ? 'border-red-500' : ''}`}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onBlur={handleConfirmBlur}
            placeholder="Confirm Password"
          />
          {errors.confirm && <p className="text-red-500 text-sm">{errors.confirm}</p>}
        </div>
        <div>
          <select
            className="select select-bordered w-full"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="brand">Brand</option>
          </select>
        </div>
        {role === 'brand' && (
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

