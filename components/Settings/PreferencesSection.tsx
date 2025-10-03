import { apiFetch } from '@lib/api';
import { useEffect, useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { NotificationContext } from '@contexts/NotificationContext';
import { SUPPORTED_LANGUAGES, SUPPORTED_CURRENCIES } from '@/types/userPreference';

interface PreferencesFormValues {
  language: string;
  currency: string;
  receiveOrderUpdates: boolean;
  receivePromotions: boolean;
}

const PreferencesSection: React.FC = () => {
  const preferencesForm = useForm<PreferencesFormValues>({
    defaultValues: {
      language: 'en',
      currency: 'USD',
      receiveOrderUpdates: true,
      receivePromotions: true,
    },
  });
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    apiFetch('/api/user/preferences')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        preferencesForm.reset({
          language: data.language || 'en',
          currency: data.currency || 'USD',
          receiveOrderUpdates: data.receiveOrderUpdates ?? true,
          receivePromotions: data.receivePromotions ?? true,
        });
      })
      .catch(() => {});
  }, [preferencesForm]);

  const submitPreferences: SubmitHandler<PreferencesFormValues> = async (
    values
  ) => {
    const res = await apiFetch('/api/user/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) addNotification('Preferences updated', 'success');
    else addNotification('Update failed', 'error');
  };

  return (
    <form
      onSubmit={preferencesForm.handleSubmit(submitPreferences)}
      className="relative w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2 mb-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Preferences
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your language, currency, and communication preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {/* Language Selection */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-semibold text-gray-700 dark:text-gray-300">
              Language
            </span>
          </label>
          <select
            {...preferencesForm.register('language')}
            className="select select-bordered w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Currency Selection */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-semibold text-gray-700 dark:text-gray-300">
              Currency
            </span>
          </label>
          <select
            {...preferencesForm.register('currency')}
            className="select select-bordered w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
          >
            {SUPPORTED_CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.name} ({curr.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="flex flex-col gap-4 mt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Communication Preferences
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose what notifications you want to receive
        </p>

        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              {...preferencesForm.register('receiveOrderUpdates')}
              className="checkbox checkbox-primary"
            />
            <div className="flex flex-col">
              <span className="label-text font-medium text-gray-900 dark:text-white">
                Order Updates
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Receive notifications about your order status and shipment
              </span>
            </div>
          </label>
        </div>

        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              {...preferencesForm.register('receivePromotions')}
              className="checkbox checkbox-primary"
            />
            <div className="flex flex-col">
              <span className="label-text font-medium text-gray-900 dark:text-white">
                Promotional Emails
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Receive special offers, discounts, and product updates
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          type="submit"
          className="btn btn-primary text-white px-8"
          disabled={preferencesForm.formState.isSubmitting}
        >
          {preferencesForm.formState.isSubmitting ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );
};

export default PreferencesSection;
