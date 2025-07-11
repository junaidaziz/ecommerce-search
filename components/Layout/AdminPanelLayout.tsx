import { useContext } from 'react';
import { AppContext } from '@contexts/AppContext';
import SuperAdminSidebar from './SuperAdminSidebar';
import { USER_ROLES } from '@/types';

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = useContext(AppContext) || {};
  const isSuperAdmin = user && user.role && user.role.toUpperCase() === USER_ROLES.SUPER_ADMIN;
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {isSuperAdmin && <SuperAdminSidebar />}
      <main className="flex-1 bg-white dark:bg-gray-950 transition-colors duration-300">{children}</main>
    </div>
  );
} 