import Link from 'next/link';
import CheckIcon from '@components/icons/CheckIcon';
import ChevronRightIcon from '@components/icons/ChevronRightIcon';
import { Button } from '@components/UI';
import type { ReactNode } from 'react';

interface AccountCardProps {
  href: string;
  title: string;
  description: string;
  features: string[];
  icon: ReactNode;
  cta: string;
  gradientClass: string;
  iconBgClass: string;
  buttonVariant?: Parameters<typeof Button>[0]['variant'];
}

const AccountCard: React.FC<AccountCardProps> = ({
  href,
  title,
  description,
  features,
  icon,
  cta,
  gradientClass,
  iconBgClass,
  buttonVariant = 'primary',
}) => (
  <div className="group relative">
    <div
      className={
        'absolute inset-0 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300 ' +
        gradientClass
      }
    />
    <Link
      href={href}
      className="relative block bg-white dark:bg-gray-800 rounded-2xl shadow-card dark:shadow-card-dark hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-8">
        <div
          className={
            'flex items-center justify-center w-16 h-16 rounded-full mb-6 mx-auto ' +
            iconBgClass
          }
        >
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
          {description}
        </p>
        <div className="space-y-3 mb-6">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
              {feat}
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button variant={buttonVariant} className="px-4 py-2">
            <span className="inline-flex items-center">
              {cta}
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </span>
          </Button>
        </div>
      </div>
    </Link>
  </div>
);

export default AccountCard;
