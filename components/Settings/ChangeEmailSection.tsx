import { useState, useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { EmailInput, TextInput } from '@components/form-fields';
import { NotificationContext } from '@contexts/NotificationContext';

interface EmailFormValues {
  email: string;
  oldToken: string;
  newToken: string;
}

const ChangeEmailSection: React.FC = () => {
  const emailForm = useForm<EmailFormValues>();
  const [codesSent, setCodesSent] = useState(false);
  const { addNotification } = useContext(NotificationContext);

  const sendCodes = async () => {
    const email = emailForm.getValues('email');
    if (!email) return;
    const res = await fetch('/api/request-email-change', {
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
  };

  const submitEmailChange: SubmitHandler<EmailFormValues> = async (values) => {
    const res = await fetch('/api/change-email', {
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
  };

  return (
    <form
      onSubmit={emailForm.handleSubmit(submitEmailChange)}
      className="space-y-2 max-w-md mx-auto"
    >
      <h2 className="text-xl font-bold mb-2">Change Email</h2>
      <EmailInput
        label="New Email"
        register={emailForm.register}
        name="email"
        rules={{ required: 'Required' }}
        error={emailForm.formState.errors.email?.message}
      />
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1">
          <TextInput
            label="Code from Old Email"
            register={emailForm.register}
            name="oldToken"
            error={emailForm.formState.errors.oldToken?.message}
            wrapperClassName="mb-0"
          />
        </div>
        <button
          type="button"
          className="btn w-full sm:w-auto"
          onClick={sendCodes}
        >
          Send Codes
        </button>
      </div>
      <TextInput
        label="Code from New Email"
        register={emailForm.register}
        name="newToken"
        error={emailForm.formState.errors.newToken?.message}
      />
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={!codesSent}
      >
        Confirm
      </button>
    </form>
  );
};

export default ChangeEmailSection;
