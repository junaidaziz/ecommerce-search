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

  const display = (value: unknown): string =>
    value !== null && value !== undefined && value !== ''
      ? String(value)
      : 'Not provided';

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
          <p className="text-lg font-semibold">{display(fullName)}</p>
          <p className="text-gray-600">
            {display(profile?.email || user.email)}
          </p>
        </div>
      </div>

      {imagePreview && (
        <button onClick={uploadImage} className="btn btn-primary btn-sm">
          Upload
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
        <div>
          <p className="text-sm text-gray-500">Full Name</p>
          <p className="font-medium">{display(fullName)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{display(profile?.email || user.email)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p className="font-medium">{display(profile?.phoneNumber)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Address</p>
          <p className="font-medium">{display(profile?.address)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">City</p>
          <p className="font-medium">{display(profile?.city)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">State</p>
          <p className="font-medium">{display((profile as Record<string, string> | undefined)?.state)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Postal Code</p>
          <p className="font-medium">{display((profile as Record<string, string> | undefined)?.postalCode)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Country</p>
          <p className="font-medium">{display(profile?.country)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Brand Name</p>
          <p className="font-medium">{display(profile?.brandName)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Business Address</p>
          <p className="font-medium">{display(profile?.businessAddress)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Website</p>
          <p className="font-medium">{display(profile?.website)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Description</p>
          <p className="font-medium">{display(profile?.businessDescription)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Tax ID</p>
          <p className="font-medium">{display(profile?.taxId)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="font-medium">{display(profile?.role)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Verified</p>
          <p className="font-medium">
            {profile ? (profile.verified ? 'Yes' : 'No') : 'Not provided'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Disabled</p>
          <p className="font-medium">
            {profile ? (profile.disabled ? 'Yes' : 'No') : 'Not provided'}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="font-medium">{lastUpdated}</p>
        </div>
      </div>

      <Link href="/settings" className="btn btn-primary mt-4">
        Update Profile
      </Link>
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
