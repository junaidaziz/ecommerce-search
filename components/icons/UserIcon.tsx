import React from 'react';
import type { IconProps } from './IconProps';

const UserIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.5}
    className={className}
    aria-hidden="true"
    role="img"
    {...rest}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 21a8.25 8.25 0 1115 0"
    />
  </svg>
);

export default UserIcon;

