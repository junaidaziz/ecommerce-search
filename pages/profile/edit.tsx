import { useForm, SubmitHandler } from 'react-hook-form';
import Head from 'next/head';
import useRequireAuth from '../../hooks/useRequireAuth';
import { getPageTitle } from '../../lib/pageTitle';
import { EmailInput, PasswordInput, TextInput } from '../../components/form-fields';

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const EditProfile: React.FC = () => {
  const user = useRequireAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      password: '',
    },
  });

  const submit: SubmitHandler<FormValues> = async (data) => {
    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    reset({ ...data, password: '' });
  };

  if (!user) return null;

  return (
    <div className="max-w-sm mx-auto">
      <Head>
        <title>{getPageTitle('Update Profile')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Update Profile</h1>
      <form onSubmit={handleSubmit(submit)} className="space-y-2">
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
        <EmailInput<FormValues>
          label="Email"
          name="email"
          register={register}
          rules={{ required: 'Required' }}
          error={errors.email?.message}
        />
        <PasswordInput<FormValues>
          label="Password"
          name="password"
          register={register}
          rules={{}}
          error={errors.password?.message}
        />
        <button type="submit" className="btn btn-primary w-full">
          Save
        </button>
      </form>
    </div>
  );
};

export default EditProfile;

