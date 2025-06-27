import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import useRequireAuth from '../hooks/useRequireAuth';
import { getPageTitle } from '../lib/pageTitle';
import type { User } from '../types/user';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const Profile: React.FC = () => {
  const user = useRequireAuth();
  const [profile, setProfile] = useState<User | null>(null);
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

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Head>
        <title>{getPageTitle('My Profile')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      <div className="flex items-center gap-4">
        {profile?.logo ? (
          <img
            src={profile.logo}
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300" />
        )}
        <div>
          <p className="text-lg font-semibold">{display(fullName)}</p>
          <p className="text-gray-600">
            {display(profile?.email || user.email)}
          </p>
        </div>
      </div>

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

      <Link href="/profile/edit" className="btn btn-primary mt-4">
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
