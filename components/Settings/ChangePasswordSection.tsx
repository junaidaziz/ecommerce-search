import { apiFetch } from '@lib/api';
import { useContext, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { PasswordInput } from '@components/form-fields';
import { NotificationContext } from '@contexts/NotificationContext';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface PasswordFormValues {
  current: string;
  password: string;
  confirm: string;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const ChangePasswordSection: React.FC = () => {
  const passwordForm = useForm<PasswordFormValues>();
  const { addNotification } = useContext(NotificationContext);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  const submitPassword: SubmitHandler<PasswordFormValues> = async ({
    current,
    password,
  }) => {
    const res = await apiFetch('/api/change-password', {
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
    setPasswordStrength(0);
  };

  return (
    <form
      onSubmit={passwordForm.handleSubmit(submitPassword)}
      className="max-w-md mx-auto bg-base-100 rounded-2xl shadow-lg p-8 mt-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-full">
          <LockClosedIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Change Password</h2>
          <p className="text-sm text-gray-600">Update your account password</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <PasswordInput
          label="Current Password"
          register={passwordForm.register}
          name="current"
          rules={{ required: 'Required' }}
          error={passwordForm.formState.errors.current?.message}
        />
        
        <div>
          <PasswordInput
            label="New Password"
            register={passwordForm.register}
            name="password"
            rules={{
              required: 'Required',
              pattern: { value: passwordRegex, message: 'Weak password' },
            }}
            error={passwordForm.formState.errors.password?.message}
            onChange={(e) => setPasswordStrength(getPasswordStrength(e.target.value))}
          />
          {passwordForm.watch('password') && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 w-8 rounded-full transition-colors ${
                        i <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-xs font-medium ${
                  passwordStrength <= 2 ? 'text-red-500' :
                  passwordStrength <= 3 ? 'text-yellow-500' :
                  passwordStrength <= 4 ? 'text-blue-500' : 'text-green-500'
                }`}>
                  {getStrengthText(passwordStrength)}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <PasswordInput
          label="Confirm Password"
          register={passwordForm.register}
          name="confirm"
          rules={{
            required: 'Required',
            validate: (v) =>
              v === passwordForm.getValues('password') ||
              'Passwords do not match',
          }}
          error={passwordForm.formState.errors.confirm?.message}
        />
      </div>
      
      <button 
        type="submit" 
        className="btn btn-primary w-full mt-6 shadow-lg"
      >
        <ShieldCheckIcon className="w-4 h-4" />
        Change Password
      </button>
    </form>
  );
};

export default ChangePasswordSection;
