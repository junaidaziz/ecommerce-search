import { updateUserProfile } from '@lib/api/user';
import React, { useContext, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { CountrySelect } from '@components/form-fields';
import { useRouter } from 'next/router';
import { AppContext } from '@contexts/AppContext';
import { USER_ROLES, type User } from '@/types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

export const UserProfile: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const router = useRouter();
  const showComplete = router.query.complete === '1';
  type ProfileForm = {
    lastName: string;
    gender: string;
    phoneNumber: string;
    address: string;
    city: string;
    country: string;
  };
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      lastName: '',
      gender: 'other',
      phoneNumber: '',
      address: '',
      city: '',
      country: '',
    },
  });
  const [message, setMessage] = React.useState<string>('');

  useEffect(() => {
    if (user) {
      reset({
        lastName: user.lastName || '',
        gender: user.gender || 'other',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
      });
    }
  }, [user, reset]);

  const submit: SubmitHandler<ProfileForm> = async (data) => {
    setMessage('');
    try {
      await updateUserProfile(data);
      setMessage('Profile updated');
    } catch {
      setMessage('Update failed');
    }
  };

  if (!user) return <div className="p-4 text-gray-700 dark:text-gray-300">Please log in.</div>;
  if (user.role !== USER_ROLES.USER)
    return <div className="p-4 text-gray-700 dark:text-gray-300">User access required.</div>;

  return (
    <div className="max-w-sm mx-auto px-4 py-6">
      <Head>
        <title>{getPageTitle('My Profile')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">My Profile</h1>
      {showComplete && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-2 text-blue-800 dark:text-blue-200">
          Please complete your profile.
        </div>
      )}
      {message && <div className="mb-2 text-green-600 dark:text-green-400">{message}</div>}
      <form onSubmit={handleSubmit(submit)} className="space-y-2">
        <input
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Last Name"
          {...register('lastName')}
        />
        <select
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
          {...register('gender')}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Phone Number"
          {...register('phoneNumber')}
        />
        <input
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Address"
          {...register('address')}
        />
        <input
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="City"
          {...register('city')}
        />
        <CountrySelect<ProfileForm> name="country" control={control} />
        <button className="w-full px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors" type="submit">
          Update
        </button>
      </form>
    </div>
  );
};

export default UserProfile;
