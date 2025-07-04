import { useState, useEffect } from 'react';
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

const SettingsPage: React.FC = () => {
  const user = useRequireAuth();
  const router = useRouter();
  const [active, setActive] = useState<
    'profile' | 'password' | 'address' | 'email' | 'payments' | 'coupons'
  >('profile');

  useEffect(() => {
    const tab = router.query.tab as string | undefined;
    if (
      tab === 'profile' ||
      tab === 'password' ||
      tab === 'address' ||
      tab === 'email' ||
      tab === 'payments' ||
      tab === 'coupons'
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
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Head>
          <title>{getPageTitle('Settings')}</title>
        </Head>
        <SettingsSidebar active={active} onSelect={handleSelect} />
        <div className="flex-1">
          {active === 'profile' && <UpdateProfileSection />}
          {active === 'password' && <ChangePasswordSection />}
          {active === 'address' && <ManageAddressSection />}
          {active === 'email' && <ChangeEmailSection />}
          {active === 'payments' && <PaymentMethodsSection />}
          {active === 'coupons' && <CouponsSection />}
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
