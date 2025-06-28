import { useState } from 'react';
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

const SettingsPage: React.FC = () => {
  const user = useRequireAuth();
  const [active, setActive] = useState<
    'profile' | 'password' | 'address' | 'email' | 'payments'
  >('profile');

  if (!user) return null;

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Head>
          <title>{getPageTitle('Settings')}</title>
        </Head>
        <SettingsSidebar active={active} onSelect={setActive} />
        <div className="flex-1">
          {active === 'profile' && <UpdateProfileSection />}
          {active === 'password' && <ChangePasswordSection />}
          {active === 'address' && <ManageAddressSection />}
          {active === 'email' && <ChangeEmailSection />}
          {active === 'payments' && <PaymentMethodsSection />}
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
