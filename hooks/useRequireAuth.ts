import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import type { User } from '../types/user';

export default function useRequireAuth() {
  const { user } = useContext(AppContext) as { user: User | null };
  const router = useRouter();
  useEffect(() => {
    if (user === null) {
      router.replace('/login');
    }
  }, [user, router]);
  return user;
}

