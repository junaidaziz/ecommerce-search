import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppContext } from '@contexts/AppContext';
import type { User } from '@types/user';

export default function useRequireAuth() {
  const { user } = useContext(AppContext) as { user: User | null };
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/login');
    }
  }, [status, session, router]);
  return user;
}
