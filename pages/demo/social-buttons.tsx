import React from 'react';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import SocialButton from '@components/UI/SocialButton';
import GoogleIcon from '@components/icons/GoogleIcon';
import FacebookIcon from '@components/icons/FacebookIcon';
import GithubIcon from '@components/icons/GithubIcon';

/**
 * Social Button Demo Page
 * This page demonstrates the hover effects for all social login buttons
 * in both light and dark modes.
 */
export default function SocialButtonDemo() {
  const handleClick = (provider: string) => {
    console.log(`${provider} button clicked`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-8 px-4">
      <Head>
        <title>{getPageTitle('Social Button Demo')}</title>
      </Head>
      
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
            Social Login Buttons
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Hover over the buttons to see the enhanced hover effects with official brand colors
          </p>
        </div>

        {/* Buttons Container */}
        <div className="space-y-6">
          {/* Google Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Google
            </h2>
            <SocialButton
              icon={<GoogleIcon className="h-5 w-5" />}
              provider="Google"
              onClick={() => handleClick('Google')}
            >
              Continue with Google
            </SocialButton>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Official Google Red (#DB4437) background with white text on hover
            </p>
          </div>

          {/* Facebook Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Facebook
            </h2>
            <SocialButton
              icon={<FacebookIcon className="h-5 w-5" />}
              provider="Facebook"
              onClick={() => handleClick('Facebook')}
            >
              Continue with Facebook
            </SocialButton>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Official Facebook Blue (#1877F2) background with white text on hover
            </p>
          </div>

          {/* GitHub Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              GitHub
            </h2>
            <SocialButton
              icon={<GithubIcon className="h-5 w-5" />}
              provider="GitHub"
              onClick={() => handleClick('GitHub')}
            >
              Continue with GitHub
            </SocialButton>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Black (#000000) background with white text on hover
            </p>
          </div>
        </div>

        {/* Feature List */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Features
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Smooth 0.3s transitions for all hover states</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Official brand colors (Google #DB4437, Facebook #1877F2, GitHub #000000)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>White text on hover for optimal readability</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Scale effects (1.02x on hover, 0.98x on active)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Consistent icon and text alignment</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Full dark mode support with theme-appropriate colors</span>
            </li>
          </ul>
        </div>

        {/* Theme Toggle Note */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> Toggle between light and dark mode using the theme switcher 
            in the header to see how the buttons adapt to different themes.
          </p>
        </div>
      </div>
    </div>
  );
}
