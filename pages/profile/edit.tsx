import { useForm, SubmitHandler } from 'react-hook-form';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
import useRequireAuth from '../../hooks/useRequireAuth';
import { getPageTitle } from '../../lib/pageTitle';
import {
  EmailInput,
  PasswordInput,
  TextInput,
  CountrySelect,
  FileUpload,
} from '../../components/form-fields';
import type { User } from '../../types/user';

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  password: string;
  logo: FileList | null;
}

const EditProfile: React.FC = () => {
  const user = useRequireAuth();
  const [editingEmail, setEditingEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: '',
      address: '',
      city: '',
      country: '',
      password: '',
      logo: null,
    },
  });

  useEffect(() => {
    if (!user) return;
    fetch('/api/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: User | null) => {
        if (data) {
          reset({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email,
            phoneNumber: data.phoneNumber || '',
            address: data.address || '',
            city: data.city || '',
            country: data.country || '',
            password: '',
            logo: null,
          });
          if (data.updatedAt) setUpdatedAt(new Date(data.updatedAt));
        }
      })
      .finally(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [user, reset]);

  const submit: SubmitHandler<FormValues> = async (data) => {
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('address', data.address);
    formData.append('city', data.city);
    formData.append('country', data.country);
    formData.append('password', data.password);
    if (data.logo && data.logo[0]) {
      formData.append('logo', data.logo[0]);
    }
    await fetch('/api/user/profile', {
      method: 'PUT',
      body: formData,
    });
    reset({ ...data, password: '', logo: null });
  };

  if (!user) return null;
  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Head>
        <title>{getPageTitle('Update Profile')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-2">Update Profile</h1>
      {updatedAt && (
        <p className="text-sm text-right text-gray-500 mb-4">
          Last updated {dayjs(updatedAt).fromNow()}
        </p>
      )}
      <form
        onSubmit={handleSubmit(submit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <TextInput<FormValues>
          label="First Name"
          name="firstName"
          register={register}
          rules={{ required: 'Required' }}
          error={errors.firstName?.message}
        />
        <TextInput<FormValues>
          label="Last Name"
          name="lastName"
          register={register}
          rules={{ required: 'Required' }}
          error={errors.lastName?.message}
        />
        <div className="md:col-span-2 flex items-end gap-2">
          <div className="flex-1">
            <EmailInput<FormValues>
              label="Email"
              name="email"
              readOnly={!editingEmail}
              register={register}
              rules={{ required: 'Required' }}
              error={errors.email?.message}
            />
          </div>
          {!editingEmail && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                const pwd = window.prompt('Enter password to edit email');
                if (pwd) setEditingEmail(true);
              }}
            >
              Change Email
            </button>
          )}
        </div>
        <TextInput<FormValues>
          label="Phone"
          name="phoneNumber"
          register={register}
          error={errors.phoneNumber?.message}
        />
        <TextInput<FormValues>
          label="Address"
          name="address"
          register={register}
          error={errors.address?.message}
        />
        <TextInput<FormValues>
          label="City"
          name="city"
          register={register}
          error={errors.city?.message}
        />
        <CountrySelect<FormValues>
          label="Country"
          name="country"
          control={control}
          error={errors.country?.message as string}
        />
        <FileUpload<FormValues>
          label="Profile Picture"
          name="logo"
          register={register}
          className="md:col-span-2"
        />
        <PasswordInput<FormValues>
          label="Password"
          name="password"
          register={register}
          rules={{}}
          error={errors.password?.message}
        />
        <button type="submit" className="btn btn-primary md:col-span-2">
          Save
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
