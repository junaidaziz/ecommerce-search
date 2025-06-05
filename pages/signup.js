import { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

export default function Signup() {
  const { signup } = useContext(AppContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [brand, setBrand] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirm || !gender) {
      setError('All fields except brand name are required');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
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
      setError('Signup failed');
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={submit} className="space-y-2">
        <input className="input input-bordered w-full" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" />
        <input className="input input-bordered w-full" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" />
        <input className="input input-bordered w-full" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" className="input input-bordered w-full" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <input type="password" className="input input-bordered w-full" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm Password" />
        <input className="input input-bordered w-full" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Brand Name (optional)" />
        <select className="select select-bordered w-full" value={gender} onChange={e => setGender(e.target.value)}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <button className="btn btn-primary w-full" type="submit">Sign Up</button>
      </form>
    </div>
  );
}
