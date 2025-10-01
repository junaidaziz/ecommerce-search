import { apiFetch } from '@lib/api';
import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState, useRef, useContext } from 'react';
import useRequireAuth from '@hooks/useRequireAuth';
import { getPageTitle } from '@lib/pageTitle';
import { NotificationContext } from '@contexts/NotificationContext';
import { UserRole, type User, USER_ROLES } from '@/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PageContainer from '@components/Layout/PageContainer';
import { StatusLabel } from '@components/UI';
import UserIcon from '@components/icons/UserIcon';
import HomeIcon from '@components/icons/HomeIcon';
import MoneyIcon from '@components/icons/MoneyIcon';
import CheckCircleIcon from '@components/icons/CheckCircleIcon';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

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
    apiFetch('/api/user/profile')
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
    const res = await apiFetch('/api/user/profile', {
      method: 'PUT',
      body: form,
    });
    if (res.ok) {
      setFile(null);
      setImagePreview(null);
      apiFetch('/api/user/profile')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setProfile(data));
      addNotification('Profile image updated', 'success');
    } else {
      addNotification('Upload failed', 'error');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] bg-base-100 py-10 px-2">
      <div className="profile-container">
        {/* Edit Button */}
        <Link
          href="/settings"
          className="edit-button-top-right"
        >
          <PencilSquareIcon className="w-5 h-5" />
          Edit Profile
        </Link>
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="avatar-circle avatar-circle-emerald">
              {(user.firstName?.[0] || '').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase()}
            </div>
            {profile?.role && (
              <span className={`status-badge role-badge-below-avatar
                ${profile.role === USER_ROLES.SUPER_ADMIN ? 'status-badge-info' :
                  profile.role === USER_ROLES.BRAND ? 'status-badge-emerald' : 'status-badge-neutral'}`}
              >
                {profile.role === USER_ROLES.SUPER_ADMIN ? 'Admin' : profile.role === USER_ROLES.BRAND ? 'Brand' : 'User'}
              </span>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1 justify-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{renderValue(fullName)}</h1>
            <p className="text-lg text-gray-500">{renderValue(profile?.email || user.email)}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
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
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <section className="info-card">
            <h2 className="flex items-center gap-2 text-base font-semibold mb-3 text-gray-800">
              <UserIcon className="w-5 h-5" /> Contact Info
            </h2>
            {renderRow('Email', profile?.email || user.email)}
            {renderRow('Phone', profile?.phoneNumber)}
          </section>
          {/* Address Info */}
          <section className="info-card">
            <h2 className="flex items-center gap-2 text-base font-semibold mb-3 text-gray-800">
              <HomeIcon className="w-5 h-5" /> Address Info
            </h2>
            {renderRow('City', profile?.city)}
            {renderRow('State', profile?.state)}
            {renderRow('Country', profile?.country)}
            {renderRow('Postal Code', profile?.postalCode)}
          </section>
          {/* Account Info */}
          <section className="info-card md:col-span-2">
            <h2 className="flex items-center gap-2 text-base font-semibold mb-3 text-gray-800">
              <MoneyIcon className="w-5 h-5" /> Account Info
            </h2>
            {renderRow('Role', profile?.role)}
            {renderRow('Last updated', lastUpdated)}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
