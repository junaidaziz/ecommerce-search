import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Logo: React.FC = () => (
  <Link
    href="/"
    className="p-0 flex items-center cursor-pointer transition-transform duration-300 ease-out hover:scale-110 hover:-translate-y-1"
  >
    <Image
      src="/images/logo-medium.png"
      alt="Logo"
      width={120}
      height={40}
      className="max-h-10 h-auto w-auto"
      priority
    />
  </Link>
);

export default Logo;
