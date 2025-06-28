import { useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { PasswordInput } from '@components/form-fields';
import { NotificationContext } from '@contexts/NotificationContext';

interface PasswordFormValues {
  current: string;
  password: string;
  confirm: string;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const ChangePasswordSection: React.FC = () => {
  const passwordForm = useForm<PasswordFormValues>();
  const { addNotification } = useContext(NotificationContext);

  const submitPassword: SubmitHandler<PasswordFormValues> = async ({
    current,
    password,
  }) => {
    const res = await fetch('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: password }),
    });
    let message = 'Change failed';
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore
    }
    if (res.ok) addNotification('Password changed', 'success');
    else addNotification(message, 'error');
    passwordForm.reset();
  };

  return (
    <form onSubmit={passwordForm.handleSubmit(submitPassword)} className="space-y-2 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Change Password</h2>
      <PasswordInput
        label="Current Password"
        register={passwordForm.register}
        name="current"
        rules={{ required: 'Required' }}
        error={passwordForm.formState.errors.current?.message}
      />
      <PasswordInput
        label="New Password"
        register={passwordForm.register}
        name="password"
        rules={{ required: 'Required', pattern: { value: passwordRegex, message: 'Weak password' } }}
        error={passwordForm.formState.errors.password?.message}
      />
      <PasswordInput
        label="Confirm Password"
        register={passwordForm.register}
        name="confirm"
        rules={{
          required: 'Required',
          validate: (v) => v === passwordForm.getValues('password') || 'Passwords do not match',
        }}
        error={passwordForm.formState.errors.confirm?.message}
      />
      <button type="submit" className="btn btn-primary w-full">
        Change Password
      </button>
    </form>
  );
};

export default ChangePasswordSection;
