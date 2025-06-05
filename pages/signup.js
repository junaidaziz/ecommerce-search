import { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { signIn } from 'next-auth/react';

export default function Signup() {
  const { signup } = useContext(AppContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [brand, setBrand] = useState('');
  const [gender, setGender] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const submit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (!confirm) newErrors.confirm = 'Confirm password is required';
    if (!gender) newErrors.gender = 'Gender is required';
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
        gender
      });
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
        <div>
          <input
            type="password"
            className={`input input-bordered w-full ${errors.confirm ? 'border-red-500' : ''}`}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Confirm Password"
          />
          {errors.confirm && <p className="text-red-500 text-sm">{errors.confirm}</p>}
        </div>
        <div>
          <input
            className="input input-bordered w-full"
            value={brand}
            onChange={e => setBrand(e.target.value)}
            placeholder="Brand Name (optional)"
          />
        </div>
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

