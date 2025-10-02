import React from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import type { Category } from '@/types';
import { CategoryMenu } from '@lib/dynamicImports';
import { USER_ROLES } from '@/types';

interface Props {
  categories: Category[];
  maxWidthClass?: string;
}

const CategoryDropdown: React.FC<Props> = ({ categories, maxWidthClass }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as any;
  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;

  return (
    <CategoryMenu 
      isSuperAdmin={isSuperAdmin} 
      pathname={router.pathname}
      maxWidthClass={maxWidthClass}
    />
  );
};

export default CategoryDropdown;
