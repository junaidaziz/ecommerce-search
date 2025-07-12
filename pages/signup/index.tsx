import Link from 'next/link';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import UserIcon from '@components/icons/UserIcon';
import BuildingIcon from '@components/icons/BuildingIcon';
import CheckIcon from '@components/icons/CheckIcon';
import ChevronRightIcon from '@components/icons/ChevronRightIcon';

export default function Signup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Head>
        <title>{getPageTitle('Signup')}</title>
      </Head>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Join Our Community
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Choose how you'd like to get started. Whether you're a customer looking to shop or a brand wanting to sell, we have the perfect option for you.
            </p>
          </div>
        </div>
      </div>

      {/* Signup Options */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* User Signup Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <Link 
              href="/signup/user" 
              className="relative block bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
                  <UserIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Customer Account
                </h3>
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  Create your account to shop from thousands of products, track orders, and enjoy exclusive customer benefits.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                    Browse and purchase products
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                    Track orders and manage returns
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                    Access exclusive customer deals
                  </div>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Get Started
                    <ChevronRightIcon className="w-4 h-4 ml-2" />
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Brand Signup Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <Link 
              href="/signup/brand" 
              className="relative block bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6 mx-auto">
                  <BuildingIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Brand Account
                </h3>
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  Start selling your products to customers worldwide. Manage your store, track sales, and grow your business.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                    List and sell your products
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                    Manage orders and inventory
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                    Access analytics and insights
                  </div>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200">
                    Start Selling
                    <ChevronRightIcon className="w-4 h-4 ml-2" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
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
