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
      className="max-w-md mx-auto bg-base-100 rounded-2xl shadow-lg p-8 mt-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-full">
          <EnvelopeIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Change Email</h2>
          <p className="text-sm text-gray-600">Update your account email address</p>
        </div>
      </div>
      
      <div className="space-y-4">
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
            className="btn btn-outline btn-sm whitespace-nowrap"
            onClick={sendCodes}
            disabled={sendingCodes}
          >
            {sendingCodes ? (
              <>
                <div className="loading loading-spinner loading-sm"></div>
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
      
      <button
        type="submit"
        className="btn btn-primary w-full mt-6 shadow-lg"
        disabled={!codesSent || submitting}
      >
        {submitting ? (
          <>
            <div className="loading loading-spinner loading-sm"></div>
            Updating...
          </>
        ) : (
          <>
            <CheckIcon className="w-4 h-4" />
            Confirm Email Change
          </>
        )}
      </button>
    </form>
  );
};

export default ChangeEmailSection;
