import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState, useRef, useContext } from 'react';
import useRequireAuth from '@hooks/useRequireAuth';
import { getPageTitle } from '@lib/pageTitle';
import { NotificationContext } from '@contexts/NotificationContext';
import type { User } from '@/types/user';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PageContainer from '@components/Layout/PageContainer';
import { StatusLabel } from '@components/UI';
import UserIcon from '@components/icons/UserIcon';
import HomeIcon from '@components/icons/HomeIcon';
import MoneyIcon from '@components/icons/MoneyIcon';
import CheckCircleIcon from '@components/icons/CheckCircleIcon';

dayjs.extend(relativeTime);

const ProfilePage: React.FC = () => {
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
      <span className="text-gray-400 italic">Not provided</span>
    );

  const renderRow = (label: string, value: unknown) => (
    <div className="space-y-0.5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium break-words">{renderValue(value)}</p>
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
    <PageContainer className="space-y-6 max-w-3xl">
      <Head>
        <title>{getPageTitle('My Profile')}</title>
      </Head>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative" onClick={() => inputRef.current?.click()}>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="preview"
                className="w-20 h-20 rounded-full object-cover cursor-pointer"
              />
            ) : profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover cursor-pointer"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer text-white font-semibold text-xl">
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
            <h1 className="text-2xl font-bold">{renderValue(fullName)}</h1>
            <p className="text-gray-600">{renderValue(profile?.email || user.email)}</p>
            <div className="flex gap-2 mt-2">
              {profile && (
                <StatusLabel color={profile.verified ? 'success' : 'default'} size="sm">
                  {profile.verified ? 'Verified' : 'Not verified'}
                </StatusLabel>
              )}
              {profile && (
                <StatusLabel color={profile.disabled ? 'error' : 'success'} size="sm">
                  {profile.disabled ? 'Disabled' : 'Active'}
                </StatusLabel>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:flex-col sm:items-end">
          {imagePreview && (
            <button onClick={uploadImage} className="btn btn-primary btn-sm">
              Upload
            </button>
          )}
          <Link href="/settings" className="btn btn-primary btn-sm sm:btn">
            Edit Profile
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="card bg-base-100 shadow">
          <div className="card-body space-y-3">
            <h2 className="card-title text-base font-semibold flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Contact Info
            </h2>
            {renderRow('Email', profile?.email || user.email)}
            {renderRow('Phone', profile?.phoneNumber)}
          </div>
        </section>
        <section className="card bg-base-100 shadow">
          <div className="card-body space-y-3">
            <h2 className="card-title text-base font-semibold flex items-center gap-2">
              <HomeIcon className="w-5 h-5" />
              Address Info
            </h2>
            {renderRow('City', profile?.city)}
            {renderRow('State', (profile as Record<string, string> | undefined)?.state)}
            {renderRow('Country', profile?.country)}
            {renderRow('Postal Code', (profile as Record<string, string> | undefined)?.postalCode)}
          </div>
        </section>
        <section className="card bg-base-100 shadow">
          <div className="card-body space-y-3">
            <h2 className="card-title text-base font-semibold flex items-center gap-2">
              <MoneyIcon className="w-5 h-5" />
              Business Info
            </h2>
            {renderRow('Brand Name', profile?.brandName)}
            {renderRow('Website', profile?.website)}
            {renderRow('Description', profile?.businessDescription)}
            {renderRow('Business Address', profile?.businessAddress)}
          </div>
        </section>
        <section className="card bg-base-100 shadow">
          <div className="card-body space-y-3">
            <h2 className="card-title text-base font-semibold flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5" />
              Account Info
            </h2>
            {renderRow('Role', profile?.role)}
            {renderRow('Tax ID', profile?.taxId)}
            {renderRow('Last updated', lastUpdated)}
          </div>
        </section>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
