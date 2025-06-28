import { useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { PasswordInput } from '@components/form-fields';
import { NotificationContext } from '@contexts/NotificationContext';

interface PasswordFormValues {
  password: string;
  confirm: string;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const ChangePasswordSection: React.FC = () => {
  const passwordForm = useForm<PasswordFormValues>();
  const { addNotification } = useContext(NotificationContext);

  const submitPassword: SubmitHandler<PasswordFormValues> = async ({ password }) => {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) addNotification('Password changed', 'success');
    else addNotification('Change failed', 'error');
    passwordForm.reset();
  };

  return (
    <form onSubmit={passwordForm.handleSubmit(submitPassword)} className="space-y-2 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Change Password</h2>
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
