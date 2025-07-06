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
      className="relative max-w-xl mx-auto bg-base-100 rounded-2xl shadow-lg p-8 flex flex-col gap-6 mt-4"
    >
      <div className="flex flex-col items-center gap-2 mb-2">
        <div className="relative">
          <ProfileAvatarUploader />
        </div>
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mt-2">
          {role}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            className="btn btn-sm btn-outline"
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
      <button
        type="submit"
        className="btn btn-primary w-full md:w-auto md:absolute md:right-8 md:bottom-8 mt-4 md:mt-0 shadow-lg"
      >
        Save Changes
      </button>
    </form>
  );
};

export default UpdateProfileSection;
