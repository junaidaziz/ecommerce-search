import { useState, useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { EmailInput, TextInput } from '@components/form-fields';
import { NotificationContext } from '@contexts/NotificationContext';

interface EmailFormValues {
  email: string;
  token: string;
}

const ChangeEmailSection: React.FC = () => {
  const emailForm = useForm<EmailFormValues>();
  const [codeSent, setCodeSent] = useState(false);
  const { addNotification } = useContext(NotificationContext);

  const sendCode = async () => {
    const email = emailForm.getValues('email');
    if (!email) return;
    const res = await fetch('/api/request-email-change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setCodeSent(true);
      addNotification('Verification code sent', 'success');
    } else {
      addNotification('Send failed', 'error');
    }
  };

  const submitEmailChange: SubmitHandler<EmailFormValues> = async (values) => {
    const res = await fetch('/api/change-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      addNotification('Email updated', 'success');
      setCodeSent(false);
      emailForm.reset();
    } else {
      addNotification('Update failed', 'error');
    }
  };

  return (
    <form onSubmit={emailForm.handleSubmit(submitEmailChange)} className="space-y-2 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Change Email</h2>
      <EmailInput
        label="New Email"
        register={emailForm.register}
        name="email"
        rules={{ required: 'Required' }}
        error={emailForm.formState.errors.email?.message}
      />
      <div className="flex flex-col sm:flex-row sm:items-end gap-2">
        <div className="flex-1">
          <TextInput
            label="Verification Code"
            register={emailForm.register}
            name="token"
            error={emailForm.formState.errors.token?.message}
            wrapperClassName="mb-0"
          />
        </div>
        <button type="button" className="btn w-full sm:w-auto" onClick={sendCode}>
          Send Code
        </button>
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={!codeSent}>
        Confirm
      </button>
    </form>
  );
};

export default ChangeEmailSection;
