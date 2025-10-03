import { useState, useEffect } from 'react';
import { apiFetch } from '@lib/api';
import { toast } from 'sonner';
import type { NotificationPreference } from '@/types';

const NotificationPreferencesSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference>({
    id: 0,
    userId: 0,
    orderUpdates: true,
    promotions: true,
    discounts: true,
    generalUpdates: true,
    emailNotifications: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/user/notification-preferences');
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof Omit<NotificationPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await apiFetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderUpdates: preferences.orderUpdates,
          promotions: preferences.promotions,
          discounts: preferences.discounts,
          generalUpdates: preferences.generalUpdates,
          emailNotifications: preferences.emailNotifications,
        }),
      });

      if (res.ok) {
        toast.success('Notification preferences updated successfully');
        await fetchPreferences();
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Notification Preferences
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose which notifications you want to receive
        </p>
      </div>

      <div className="space-y-4">
        {/* Order Updates */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-200">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Order Updates
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get notified about your order status, shipping updates, and delivery information
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={preferences.orderUpdates}
              onChange={() => handleToggle('orderUpdates')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Promotions */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-200">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Promotions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive notifications about special offers, new products, and exclusive deals
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={preferences.promotions}
              onChange={() => handleToggle('promotions')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Discounts */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-200">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Discounts
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Be the first to know about discounts, sales, and limited-time offers
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={preferences.discounts}
              onChange={() => handleToggle('discounts')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* General Updates */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-200">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              General Updates
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Stay informed about account changes, new features, and important announcements
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={preferences.generalUpdates}
              onChange={() => handleToggle('generalUpdates')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-200">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Email Notifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive email notifications in addition to in-app notifications
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferencesSection;
