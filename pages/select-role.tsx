import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { USER_ROLES } from '@/types';

export default function SelectRole() {
  const router = useRouter();

  async function choose(role: 'USER' | 'BRAND') {
    await fetch('/api/user/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    router.replace(role === USER_ROLES.BRAND ? '/brand/profile?complete=1' : '/user/profile?complete=1');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Select Your Role</h1>
        <button className="btn btn-primary w-full" onClick={() => choose('USER')}>
          I am a User
        </button>
        <button className="btn btn-secondary w-full" onClick={() => choose('BRAND')}>
          I am a Brand
        </button>
      </div>
    </div>
  );
}
