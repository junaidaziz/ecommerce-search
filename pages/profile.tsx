import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import useRequireAuth from '@hooks/useRequireAuth';
import { getPageTitle } from '@lib/pageTitle';
import type { User } from '@types/user';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import UserIcon from '@components/icons/UserIcon';
import HomeIcon from '@components/icons/HomeIcon';
import BoxIcon from '@components/icons/BoxIcon';
import CheckCircleIcon from '@components/icons/CheckCircleIcon';
import PencilIcon from '@components/icons/PencilIcon';

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

  const display = (value: unknown): React.ReactNode =>
    value !== null && value !== undefined && value !== '' ? (
      String(value)
    ) : (
      <span className="text-gray-400">&#8212;</span>
    );

  const Field: React.FC<{
    label: string;
    value: React.ReactNode;
  }> = ({ label, value }) => (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium break-words">{value}</p>
      </div>
      <PencilIcon className="w-4 h-4 text-gray-400" />
    </div>
  );

  const Section: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ title, icon, children }) => (
    <section className="bg-base-100 border rounded shadow p-4 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
        {icon}
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Link href="/profile/edit" className="btn btn-primary">
          Update Profile
        </Link>
      </div>

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

      <div className="space-y-4 mt-4">
        <Section title="Personal Info" icon={<UserIcon className="w-5 h-5" />}>
          <Field label="Full Name" value={display(fullName)} />
          <Field label="Email" value={display(profile?.email || user.email)} />
          <Field label="Gender" value={display(profile?.gender)} />
          <Field label="Phone" value={display(profile?.phoneNumber)} />
        </Section>
        <Section title="Location Info" icon={<HomeIcon className="w-5 h-5" />}>
          <Field label="Address" value={display(profile?.address)} />
          <Field label="City" value={display(profile?.city)} />
          <Field label="State" value={display((profile as Record<string, string> | undefined)?.state)} />
          <Field label="Country" value={display(profile?.country)} />
        </Section>
        <Section title="Brand Info" icon={<BoxIcon className="w-5 h-5" />}>
          <Field label="Brand Name" value={display(profile?.brandName)} />
          <Field label="Website" value={display(profile?.website)} />
          <Field label="Business Address" value={display(profile?.businessAddress)} />
          <Field label="Tax ID" value={display(profile?.taxId)} />
        </Section>
        <Section title="System Info" icon={<CheckCircleIcon className="w-5 h-5" />}>
          <Field label="Role" value={display(profile?.role)} />
          <Field label="Status" value={profile ? (profile.disabled ? 'Disabled' : 'Active') : display(undefined)} />
          <Field label="Verified" value={profile ? (profile.verified ? 'Yes' : 'No') : display(undefined)} />
          <Field label="Last Updated" value={lastUpdated} />
        </Section>
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
