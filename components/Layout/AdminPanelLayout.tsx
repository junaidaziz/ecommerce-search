import { useContext } from 'react';
import { AppContext } from '@contexts/AppContext';
import SuperAdminSidebar from './SuperAdminSidebar';
import { USER_ROLES } from '@/types';

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = useContext(AppContext) || {};
  const isSuperAdmin = user && user.role && user.role.toUpperCase() === USER_ROLES.SUPER_ADMIN;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex">
      {isSuperAdmin && <SuperAdminSidebar />}
      <main className="flex-1">{children}</main>
    </div>
  );
} 