import { apiFetch } from '@lib/api';
import { useEffect, useContext, useState } from 'react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TextInput, EmailInput } from '@components/form-fields';
import { NotificationContext } from '@contexts/NotificationContext';
import ProfileAvatarUploader from '@components/ProfileAvatarUploader';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

const UpdateProfileSection: React.FC = () => {
  const profileForm = useForm<ProfileFormValues>();
  const { addNotification } = useContext(NotificationContext);
  const [role, setRole] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  useEffect(() => {
    apiFetch('/api/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        profileForm.reset({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
        });
        setRole(data.role || '');
        setUpdatedAt(
          data.updatedAt ? new Date(data.updatedAt).toLocaleString() : ''
        );
      })
      .catch(() => {});
  }, [profileForm]);

  const submitProfile: SubmitHandler<ProfileFormValues> = async (values) => {
    const res = await apiFetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) addNotification('Profile updated', 'success');
    else addNotification('Update failed', 'error');
  };

  return (
    <form
      onSubmit={profileForm.handleSubmit(submitProfile)}
      className="relative w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 flex flex-col gap-6"
    >
      <div className="flex flex-col items-center gap-3 mb-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <ProfileAvatarUploader />
        </div>
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light text-sm font-semibold uppercase tracking-wide">
          {role}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <TextInput
          label="First Name"
          register={profileForm.register}
          name="firstName"
          rules={{ required: 'Required' }}
          error={profileForm.formState.errors.firstName?.message}
        />
        <TextInput
          label="Last Name"
          register={profileForm.register}
          name="lastName"
          rules={{ required: 'Required' }}
          error={profileForm.formState.errors.lastName?.message}
        />
        <div className="md:col-span-2 flex gap-2 items-end">
          <div className="flex-1">
            <EmailInput
              label="Email"
              register={profileForm.register}
              name="email"
              readOnly
              rules={{ required: 'Required' }}
              error={profileForm.formState.errors.email?.message}
            />
          </div>
          <Link
            href={{ pathname: '/settings', query: { tab: 'email' } }}
            className="px-4 py-2.5 text-sm font-medium text-primary hover:text-white bg-primary/10 hover:bg-primary dark:bg-primary/20 dark:hover:bg-primary rounded-lg transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
          >
            Change Email
          </Link>
        </div>
        <TextInput
          label="Phone Number"
          register={profileForm.register}
          name="phoneNumber"
          error={profileForm.formState.errors.phoneNumber?.message}
          className="md:col-span-2"
        />
        <TextInput label="Role" name="role" value={role} readOnly className="md:col-span-2" />
        <TextInput
          label="Last Updated"
          name="updatedAt"
          value={updatedAt}
          readOnly
          className="md:col-span-2"
        />
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          type="submit"
          className="px-8 py-3 text-base font-semibold text-white bg-primary hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-light rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default UpdateProfileSection;
