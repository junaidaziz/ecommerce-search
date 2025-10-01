import Link from 'next/link';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import UserIcon from '@components/icons/UserIcon';
import BuildingIcon from '@components/icons/BuildingIcon';
import { AccountCard } from '@components/Signup';
import ChevronRightIcon from '@components/icons/ChevronRightIcon';

export default function Signup() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>{getPageTitle('Signup')}</title>
      </Head>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="signup-gradient-overlay" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Join Our Community</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose how you&apos;d like to get started. Whether you&apos;re a customer looking to shop or a brand wanting to sell, we have the perfect option for you.
          </p>
        </div>
      </div>

      {/* Signup Options */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          <AccountCard
            href="/signup/user"
            title="Customer Account"
            description="Create your account to shop from thousands of products, track orders, and enjoy exclusive customer benefits."
            cta="Get Started"
            gradientClass="bg-gradient-to-r from-blue-500 to-blue-600"
            iconBgClass="bg-blue-100 dark:bg-blue-800/40"
            icon={<UserIcon className="w-8 h-8 text-blue-600" />}
            features={[
              'Browse and purchase products',
              'Track orders and manage returns',
              'Access exclusive customer deals',
            ]}
            buttonVariant="primary"
          />

          <AccountCard
            href="/signup/brand"
            title="Brand Account"
            description="Start selling your products to customers worldwide. Manage your store, track sales, and grow your business."
            cta="Start Selling"
            gradientClass="bg-gradient-to-r from-purple-500 to-purple-600"
            iconBgClass="bg-purple-100 dark:bg-purple-800/40"
            icon={<BuildingIcon className="w-8 h-8 text-purple-600" />}
            features={[
              'List and sell your products',
              'Manage orders and inventory',
              'Access analytics and insights',
            ]}
            buttonVariant="secondary"
          />
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-4">
            Already have an account?
          </p>
          <Link 
            href="/login" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            Sign in to your account
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
