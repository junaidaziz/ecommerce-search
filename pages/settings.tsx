import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import useRequireAuth from '@hooks/useRequireAuth';
import PageContainer from '@components/Layout/PageContainer';
import UpdateProfileSection from '@components/Settings/UpdateProfileSection';
import ChangePasswordSection from '@components/Settings/ChangePasswordSection';
import ManageAddressSection from '@components/Settings/ManageAddressSection';
import ChangeEmailSection from '@components/Settings/ChangeEmailSection';
import PaymentMethodsSection from '@components/Settings/PaymentMethodsSection';
import SettingsSidebar from '@components/Settings/SettingsSidebar';
import CouponsSection from '@components/Settings/CouponsSection';
import BrandSettingsSection from '@components/Settings/BrandSettingsSection';
import PreferencesSection from '@components/Settings/PreferencesSection';
import { AppContext } from '@contexts/AppContext';
import type { User } from '@/types';

const SettingsPage: React.FC = () => {
  const user = useRequireAuth();
  const { user: contextUser } = useContext(AppContext) as { user: User | null };
  const router = useRouter();
  const [active, setActive] = useState<
    'profile' | 'password' | 'address' | 'email' | 'payments' | 'coupons' | 'brand' | 'preferences'
  >('profile');

  useEffect(() => {
    const tab = router.query.tab as string | undefined;
    if (
      tab === 'profile' ||
      tab === 'password' ||
      tab === 'address' ||
      tab === 'email' ||
      tab === 'payments' ||
      tab === 'coupons' ||
      tab === 'brand' ||
      tab === 'preferences'
    ) {
      setActive(tab);
    }
  }, [router.query.tab]);

  const handleSelect = (tab: typeof active) => {
    setActive(tab);
    router.replace({ pathname: '/settings', query: { tab } }, undefined, {
      shallow: true,
    });
  };

  if (!user) return null;

  return (
    <PageContainer>
      <Head>
        <title>{getPageTitle('Settings')}</title>
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <SettingsSidebar active={active} onSelect={handleSelect} userRole={contextUser?.role} />
            <div className="flex-1 w-full">
              {active === 'profile' && <UpdateProfileSection />}
              {active === 'brand' && <BrandSettingsSection />}
              {active === 'preferences' && <PreferencesSection />}
              {active === 'password' && <ChangePasswordSection />}
              {active === 'address' && <ManageAddressSection />}
              {active === 'email' && <ChangeEmailSection />}
              {active === 'payments' && <PaymentMethodsSection />}
              {active === 'coupons' && <CouponsSection />}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
