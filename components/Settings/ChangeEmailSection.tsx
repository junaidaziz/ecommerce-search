import { apiFetch } from '@lib/api';
import { useState, useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { EmailInput, TextInput } from '@components/form-fields';
import { NotificationContext } from '@contexts/NotificationContext';
import { EnvelopeIcon, CheckIcon } from '@heroicons/react/24/outline';

interface EmailFormValues {
  email: string;
  oldToken: string;
  newToken: string;
}

const ChangeEmailSection: React.FC = () => {
  const emailForm = useForm<EmailFormValues>();
  const [codesSent, setCodesSent] = useState(false);
  const [sendingCodes, setSendingCodes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addNotification } = useContext(NotificationContext);

  const sendCodes = async () => {
    const email = emailForm.getValues('email');
    if (!email) return;
    
    setSendingCodes(true);
    const res = await apiFetch('/api/request-email-change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setCodesSent(true);
      addNotification('Verification codes sent', 'success');
    } else {
      addNotification('Send failed', 'error');
    }
    setSendingCodes(false);
  };

  const submitEmailChange: SubmitHandler<EmailFormValues> = async (values) => {
    setSubmitting(true);
    const res = await apiFetch('/api/change-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: values.email,
        oldToken: values.oldToken,
        newToken: values.newToken,
      }),
    });
    if (res.ok) {
      addNotification('Email updated', 'success');
      setCodesSent(false);
      emailForm.reset();
    } else {
      addNotification('Update failed', 'error');
    }
    setSubmitting(false);
  };

  return (
    <form
      onSubmit={emailForm.handleSubmit(submitEmailChange)}
      className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8"
    >
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
          <EnvelopeIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Change Email</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Update your account email address</p>
        </div>
      </div>
      
      <div className="space-y-5">
        <EmailInput
          label="New Email"
          register={emailForm.register}
          name="email"
          rules={{ required: 'Required' }}
          error={emailForm.formState.errors.email?.message}
        />
        
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <TextInput
              label="Code from Old Email"
              register={emailForm.register}
              name="oldToken"
              error={emailForm.formState.errors.oldToken?.message}
              placeholder="Enter verification code"
            />
          </div>
          <button
            type="button"
            className="px-6 py-2.5 text-sm font-medium text-primary hover:text-white bg-primary/10 hover:bg-primary dark:bg-primary/20 dark:hover:bg-primary rounded-lg transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
            onClick={sendCodes}
            disabled={sendingCodes}
          >
            {sendingCodes ? (
              <>
                <div className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending...
              </>
            ) : (
              'Send Codes'
            )}
          </button>
        </div>
        
        <TextInput
          label="Code from New Email"
          register={emailForm.register}
          name="newToken"
          error={emailForm.formState.errors.newToken?.message}
          placeholder="Enter verification code"
        />
      </div>
      
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800 mt-6">
        <button
          type="submit"
          className="px-8 py-3 text-base font-semibold text-white bg-success hover:bg-success-dark dark:bg-success dark:hover:bg-success-light rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!codesSent || submitting}
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Updating...
            </>
          ) : (
            <>
              <CheckIcon className="w-5 h-5" />
              Confirm Email Change
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ChangeEmailSection;
