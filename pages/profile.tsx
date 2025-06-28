import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState, useRef, useContext } from 'react';
import useRequireAuth from '@hooks/useRequireAuth';
import { getPageTitle } from '@lib/pageTitle';
import { NotificationContext } from '@contexts/NotificationContext';
import type { User } from '@/types/user';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const Profile: React.FC = () => {
  const user = useRequireAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { addNotification } = useContext(NotificationContext);
  useEffect(() => {
    if (!user) return;
    fetch('/api/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProfile(data))
      .catch(() => {});
  }, [user]);
  if (!user) return null;

  const renderValue = (value: unknown): JSX.Element | string =>
    value !== null && value !== undefined && value !== '' ? (
      <>{String(value)}</>
    ) : (
      <span className="text-gray-500">&mdash;</span>
    );

  const renderRow = (label: string, value: unknown) => (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{renderValue(value)}</p>
    </div>
  );

  const lastUpdated = profile?.updatedAt
    ? `Updated ${dayjs(profile.updatedAt).fromNow()}`
    : 'Never updated';

  const fullName = `${profile?.firstName || user.firstName || ''} ${
    profile?.lastName || user.lastName || ''
  }`.trim();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png'].includes(f.type)) {
      addNotification('Only JPEG or PNG images allowed', 'error');
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      addNotification('File must be under 2MB', 'error');
      return;
    }
    setFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const uploadImage = async () => {
    if (!file) return;
    const form = new FormData();
    form.append('profileImage', file);
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      body: form,
    });
    if (res.ok) {
      setFile(null);
      setImagePreview(null);
      fetch('/api/user/profile')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setProfile(data));
      addNotification('Profile image updated', 'success');
    } else {
      addNotification('Upload failed', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Head>
        <title>{getPageTitle('My Profile')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      <div className="flex items-center gap-4">
        <div className="relative" onClick={() => inputRef.current?.click()}>
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="preview"
              className="w-16 h-16 rounded-full object-cover cursor-pointer"
            />
          ) : profile?.profileImage ? (
            <img
              src={profile.profileImage}
              alt="avatar"
              className="w-16 h-16 rounded-full object-cover cursor-pointer"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer text-white font-semibold">
              {(user.firstName?.[0] || '').toUpperCase()}
              {(user.lastName?.[0] || '').toUpperCase()}
            </div>
          )}
          <input
            type="file"
            ref={inputRef}
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleChange}
          />
        </div>
        <div>
          <p className="text-lg font-semibold">{renderValue(fullName)}</p>
          <p className="text-gray-600">
            {renderValue(profile?.email || user.email)}
          </p>
        </div>
      </div>

      {imagePreview && (
        <button onClick={uploadImage} className="btn btn-primary btn-sm">
          Upload
        </button>
      )}

      <Link href="/settings" className="btn btn-primary mt-4">
        Update Profile
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <section className="space-y-2 bg-base-100 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold border-b pb-2 mb-2">Contact Info</h2>
          {renderRow('Email', profile?.email || user.email)}
          {renderRow('Phone', profile?.phoneNumber)}
        </section>
        <section className="space-y-2 bg-base-100 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold border-b pb-2 mb-2">Address Info</h2>
          {renderRow('City', profile?.city)}
          {renderRow('State', (profile as Record<string, string> | undefined)?.state)}
          {renderRow('Country', profile?.country)}
          {renderRow('Postal Code', (profile as Record<string, string> | undefined)?.postalCode)}
        </section>
        <section className="space-y-2 bg-base-100 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold border-b pb-2 mb-2">Business Info</h2>
          {renderRow('Brand Name', profile?.brandName)}
          {renderRow('Website', profile?.website)}
          {renderRow('Description', profile?.businessDescription)}
          {renderRow('Business Address', profile?.businessAddress)}
        </section>
        <section className="space-y-2 bg-base-100 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold border-b pb-2 mb-2">Account Info</h2>
          {renderRow('Role', profile?.role)}
          {renderRow('Tax ID', profile?.taxId)}
          <div>
            <p className="text-sm text-gray-500">Verified</p>
            <p className="font-medium">
              {profile ? (
                profile.verified ? (
                  <span className="badge badge-success">Verified</span>
                ) : (
                  <span className="badge">Not Verified</span>
                )
              ) : (
                renderValue(null)
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Disabled</p>
            <p className="font-medium">
              {profile ? (
                profile.disabled ? (
                  <span className="badge badge-error">Disabled</span>
                ) : (
                  <span className="badge badge-success">Active</span>
                )
              ) : (
                renderValue(null)
              )}
            </p>
          </div>
          {renderRow('Last updated', lastUpdated)}
        </section>
      </div>

    </div>
  );
};
export default Profile;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session?.user) {
    return {
      redirect: { destination: '/login', permanent: false },
    };
  }
  return { props: {} };
};
