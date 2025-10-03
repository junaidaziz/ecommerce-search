import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Hook to track user session activity
 * This will create a session record on login and ping the server every 5 minutes to update session activity
 */
export function useSessionTracking() {
  const { data: session, status } = useSession();
  const sessionCreated = useRef(false);

  const createSession = useCallback(async () => {
    if (sessionCreated.current) return;
    
    try {
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        sessionCreated.current = true;
      }
    } catch (error) {
      // Silently fail - session tracking is not critical
      console.debug('Failed to create session:', error);
    }
  }, []);

  const pingSession = useCallback(async () => {
    if (status === 'authenticated' && session?.user) {
      try {
        await fetch('/api/sessions/ping', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        // Silently fail - session tracking is not critical
        console.debug('Failed to update session activity:', error);
      }
    }
  }, [status, session]);

  useEffect(() => {
    if (status === 'authenticated') {
      // Create session record on first authentication
      createSession();

      // Ping immediately on mount
      pingSession();

      // Set up interval to ping every 5 minutes
      const interval = setInterval(pingSession, 5 * 60 * 1000);

      return () => clearInterval(interval);
    } else if (status === 'unauthenticated') {
      // Reset the flag when logged out
      sessionCreated.current = false;
    }
  }, [status, createSession, pingSession]);
}
