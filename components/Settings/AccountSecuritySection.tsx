import { apiFetch } from '@lib/api';
import { useContext, useState } from 'react';
import { NotificationContext } from '@contexts/NotificationContext';
import { ShieldCheckIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';

const AccountSecuritySection: React.FC = () => {
  const { addNotification } = useContext(NotificationContext);
  const router = useRouter();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleTwoFactorToggle = () => {
    // Placeholder for future 2FA implementation
    addNotification('Two-Factor Authentication is coming soon!', 'info');
  };

  const handleDeactivateAccount = async () => {
    if (isDeactivating) return;
    
    setIsDeactivating(true);
    try {
      const res = await apiFetch('/api/user/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (res.ok) {
        addNotification('Account deactivated successfully', 'success');
        // Sign out the user
        await signOut({ redirect: false });
        router.push('/');
      } else {
        const data = await res.json();
        addNotification(data.message || 'Failed to deactivate account', 'error');
      }
    } catch (error) {
      addNotification('Failed to deactivate account', 'error');
    } finally {
      setIsDeactivating(false);
      setShowDeactivateConfirm(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE' || isDeleting) return;
    
    setIsDeleting(true);
    try {
      const res = await apiFetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (res.ok) {
        addNotification('Account deleted successfully', 'success');
        // Sign out the user
        await signOut({ redirect: false });
        router.push('/');
      } else {
        const data = await res.json();
        addNotification(data.message || 'Failed to delete account', 'error');
      }
    } catch (error) {
      addNotification('Failed to delete account', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Two-Factor Authentication Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="p-3 bg-green-500/10 dark:bg-green-500/20 rounded-xl">
            <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security (Coming Soon)</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Enable Two-Factor Authentication
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Protect your account with an additional security layer
            </p>
          </div>
          <button
            onClick={handleTwoFactorToggle}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              twoFactorEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            disabled
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Two-Factor Authentication feature is currently under development and will be available soon.
          </p>
        </div>
      </div>

      {/* Deactivate Account Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="p-3 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-xl">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Deactivate Account</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Temporarily disable your account</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Deactivating your account will:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400 ml-4">
            <li>Disable your account temporarily</li>
            <li>Hide your profile from other users</li>
            <li>Prevent you from logging in</li>
            <li>Keep your data intact for future reactivation</li>
          </ul>
          
          {!showDeactivateConfirm ? (
            <button
              onClick={() => setShowDeactivateConfirm(true)}
              className="mt-4 px-6 py-3 text-base font-semibold text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 rounded-xl transition-all duration-200 border border-yellow-300 dark:border-yellow-700"
            >
              Deactivate Account
            </button>
          ) : (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl space-y-4">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                Are you sure you want to deactivate your account?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeactivateAccount}
                  disabled={isDeactivating}
                  className="px-6 py-2 text-sm font-semibold text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeactivating ? 'Deactivating...' : 'Yes, Deactivate'}
                </button>
                <button
                  onClick={() => setShowDeactivateConfirm(false)}
                  disabled={isDeactivating}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-red-200 dark:border-red-800">
          <div className="p-3 bg-red-500/10 dark:bg-red-500/20 rounded-xl">
            <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Delete Account</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete your account</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
              ⚠️ Warning: This action cannot be undone!
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              Deleting your account will permanently remove all your data, including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300 ml-4 mt-2">
              <li>Profile information</li>
              <li>Order history</li>
              <li>Saved addresses</li>
              <li>Payment methods</li>
              <li>Wishlist items</li>
              <li>All other account data</li>
            </ul>
          </div>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 px-6 py-3 text-base font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Delete Account Permanently
            </button>
          ) : (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl space-y-4">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                This action is permanent and cannot be undone. All your data will be lost.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Type DELETE"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className="px-6 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Forever'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  disabled={isDeleting}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSecuritySection;
