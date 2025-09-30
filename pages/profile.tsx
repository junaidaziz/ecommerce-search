import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import ProfilePage from '@components/pages/ProfilePage';

export default ProfilePage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions(context.req, context.res));
  if (!session?.user?.email) {
    return {
      redirect: { destination: '/login', permanent: false },
    };
  }
  return { props: {} };
};
