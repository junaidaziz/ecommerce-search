import { updateUserProfile } from '@lib/api/user';
import React, { useContext, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { CountrySelect } from '@components/form-fields';
import { useRouter } from 'next/router';
import { AppContext } from '@contexts/AppContext';
import { UserRole, type User } from '@/types';
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

  if (!user) return <div className="p-4">Please log in.</div>;
  if (user.role?.toUpperCase() !== UserRole.USER)
    return <div className="p-4">User access required.</div>;

  return (
    <div className="max-w-sm mx-auto">
      <Head>
        <title>{getPageTitle('My Profile')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      {showComplete && (
        <div className="alert alert-info mb-2">
          Please complete your profile.
        </div>
      )}
      {message && <div className="mb-2 text-green-600">{message}</div>}
      <form onSubmit={handleSubmit(submit)} className="space-y-2">
        <input
          className="input input-bordered w-full"
          placeholder="Last Name"
          {...register('lastName')}
        />
        <select
          className="select select-bordered w-full"
          {...register('gender')}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input
          className="input input-bordered w-full"
          placeholder="Phone Number"
          {...register('phoneNumber')}
        />
        <input
          className="input input-bordered w-full"
          placeholder="Address"
          {...register('address')}
        />
        <input
          className="input input-bordered w-full"
          placeholder="City"
          {...register('city')}
        />
        <CountrySelect<ProfileForm> name="country" control={control} />
        <button className="btn btn-primary w-full" type="submit">
          Update
        </button>
      </form>
    </div>
  );
};

export default UserProfile;
