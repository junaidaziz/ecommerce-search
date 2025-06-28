import { useEffect, useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TextInput, EmailInput } from '@components/form-fields';
import { NotificationContext } from '@contexts/NotificationContext';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

const UpdateProfileSection: React.FC = () => {
  const profileForm = useForm<ProfileFormValues>();
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        profileForm.reset({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
        });
      })
      .catch(() => {});
  }, [profileForm]);

  const submitProfile: SubmitHandler<ProfileFormValues> = async (values) => {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) addNotification('Profile updated', 'success');
    else addNotification('Update failed', 'error');
  };

  return (
    <form onSubmit={profileForm.handleSubmit(submitProfile)} className="space-y-2 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Update Profile</h2>
      <TextInput
        label="First Name"
        register={profileForm.register}
        name="firstName"
        rules={{ required: 'Required' }}
        error={profileForm.formState.errors.firstName?.message}
        wrapperClassName="md:col-span-2"
      />
      <TextInput
        label="Last Name"
        register={profileForm.register}
        name="lastName"
        rules={{ required: 'Required' }}
        error={profileForm.formState.errors.lastName?.message}
      />
      <EmailInput
        label="Email"
        register={profileForm.register}
        name="email"
        rules={{ required: 'Required' }}
        error={profileForm.formState.errors.email?.message}
      />
      <TextInput
        label="Phone Number"
        register={profileForm.register}
        name="phoneNumber"
        error={profileForm.formState.errors.phoneNumber?.message}
      />
      <button type="submit" className="btn btn-primary w-full">
        Save
      </button>
    </form>
  );
};

export default UpdateProfileSection;
