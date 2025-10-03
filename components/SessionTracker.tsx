import { ReactNode } from 'react';
import { useSessionTracking } from '@hooks/useSessionTracking';

interface SessionTrackerProps {
  children: ReactNode;
}

/**
 * Component that tracks session activity
 * Wraps the app and automatically updates session activity
 */
export function SessionTracker({ children }: SessionTrackerProps) {
  useSessionTracking();
  return <>{children}</>;
}
