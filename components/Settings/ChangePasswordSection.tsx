import { apiFetch } from '@lib/api';
import { useContext, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordInput } from '@components/form-fields';
import { NotificationContext } from '@contexts/NotificationContext';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { changePasswordSchema, type ChangePasswordFormData } from '@lib/validation';

interface PasswordFormValues {
  current: string;
  password: string;
  confirm: string;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const ChangePasswordSection: React.FC = () => {
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
  });
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

  const submitPassword: SubmitHandler<ChangePasswordFormData> = async ({
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
      className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8"
    >
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
          <LockClosedIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Change Password</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
        </div>
      </div>
      
      <div className="space-y-5">
        <div>
          <PasswordInput
            label="Current Password"
            register={passwordForm.register}
            name="current"
            error={passwordForm.formState.errors.current?.message}
          />
          <div className="mt-2">
            <Link 
              href="/reset" 
              className="text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
        
        <div>
          <PasswordInput
            label="New Password"
            register={passwordForm.register}
            name="password"
            error={passwordForm.formState.errors.password?.message}
            onChange={(e) => setPasswordStrength(getPasswordStrength(e.target.value))}
          />
          {passwordForm.watch('password') && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex gap-1.5 flex-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                        i <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wide ${
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
          error={passwordForm.formState.errors.confirm?.message}
        />
      </div>
      
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800 mt-6">
        <button 
          type="submit" 
          className="px-8 py-3 text-base font-semibold text-white bg-primary hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-light rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center gap-2"
        >
          <ShieldCheckIcon className="w-5 h-5" />
          Change Password
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordSection;
