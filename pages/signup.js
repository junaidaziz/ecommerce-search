import { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

export default function Signup() {
  const { signup } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password required');
      return;
    }
    try {
      await signup(email, password);
    } catch (e) {
      setError('Signup failed');
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={submit} className="space-y-2">
        <input className="input input-bordered w-full" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" className="input input-bordered w-full" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button className="btn btn-primary w-full" type="submit">Sign Up</button>
      </form>
    </div>
  );
}
