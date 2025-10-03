import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { useRequireAuth } from '@hooks/useRequireAuth';
import type { LoginSessionInfo } from '@pages/api/sessions/list';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const SecuritySettings: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();
  const [sessions, setSessions] = useState<LoginSessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [revoking, setRevoking] = useState<string | null>(null);

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sessions/list');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      setSessions(data.sessions);
      setError('');
    } catch (err) {
      setError('Failed to load sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const handleRevoke = async (sessionId: string) => {
    if (!confirm('Are you sure you want to logout this session?')) {
      return;
    }

    try {
      setRevoking(sessionId);
      const response = await fetch('/api/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to revoke session');
      }

      // Refresh sessions list
      await fetchSessions();
    } catch (err) {
      alert('Failed to logout session. Please try again.');
      console.error(err);
    } finally {
      setRevoking(null);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>{getPageTitle('Security Settings')}</title>
        </Head>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{getPageTitle('Security Settings')}</title>
      </Head>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Security Settings
        </h1>

        {/* Active Sessions Section */}
        <section className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Active Login Sessions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Manage devices where you're currently logged in. You can logout from
              any device remotely.
            </p>

            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {sessions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No active sessions found
                </p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.uuid}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {session.deviceInfo || 'Unknown Device'}
                          </h3>
                          {session.isCurrent && (
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                              Current Session
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {session.ipAddress && (
                            <p>IP Address: {session.ipAddress}</p>
                          )}
                          <p>
                            Last Active: {dayjs(session.lastActivity).fromNow()}
                          </p>
                          <p>
                            Signed in: {dayjs(session.createdAt).format('MMM D, YYYY [at] h:mm A')}
                          </p>
                        </div>
                      </div>

                      {!session.isCurrent && (
                        <button
                          onClick={() => handleRevoke(session.uuid)}
                          disabled={revoking === session.uuid}
                          className="ml-4 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {revoking === session.uuid ? 'Logging out...' : 'Logout'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Password Management Section */}
        <section className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Password Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Keep your account secure by regularly updating your password.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => router.push('/auth/forgot-password')}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Change Password
              </button>
            </div>
          </div>
        </section>

        {/* Two-Factor Authentication Section (Placeholder) */}
        <section className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Add an extra layer of security to your account by enabling
                  two-factor authentication.
                </p>
              </div>
              <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs px-3 py-1 rounded-full font-medium">
                Coming Soon
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  🔒 Enhanced Security (Coming Soon)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Two-factor authentication will require a verification code in
                  addition to your password when logging in, providing an extra
                  layer of protection for your account.
                </p>
              </div>

              <button
                disabled
                className="w-full sm:w-auto px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium rounded-md cursor-not-allowed"
              >
                Enable Two-Factor Authentication
              </button>
            </div>
          </div>
        </section>

        {/* Additional Security Tips */}
        <section className="mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
              💡 Security Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
              <li>• Use a strong, unique password for your account</li>
              <li>• Regularly review your active sessions and logout unknown devices</li>
              <li>• Never share your password with anyone</li>
              <li>• Be cautious of phishing emails asking for your credentials</li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
};

export default SecuritySettings;
