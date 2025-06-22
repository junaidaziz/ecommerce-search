import Link from 'next/link';
import Head from 'next/head';
import useRequireAuth from '../hooks/useRequireAuth';
import { getPageTitle } from '../lib/pageTitle';

const Profile: React.FC = () => {
  const user = useRequireAuth();
  if (!user) return null;

  return (
    <div className="max-w-sm mx-auto space-y-2">
      <Head>
        <title>{getPageTitle('My Profile')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <p>
        <strong>Name:</strong> {user.firstName} {user.lastName}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <Link href="/profile/edit" className="btn btn-primary mt-4">
        Update Profile
      </Link>
    </div>
  );
};

export default Profile;

