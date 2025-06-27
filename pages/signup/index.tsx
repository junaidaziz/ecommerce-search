import Link from 'next/link';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import PageContainer from '@components/Layout/PageContainer';

export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center overflow-auto px-4 py-6 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Signup')}</title>
      </Head>
      <PageContainer className="space-y-4 max-w-sm -mt-8">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Choose Signup Type
        </h1>
        <Link href="/signup/user" className="btn btn-primary w-full">
          User Signup
        </Link>
        <Link href="/signup/brand" className="btn btn-secondary w-full">
          Brand Signup
        </Link>
      </PageContainer>
    </div>
  );
}
