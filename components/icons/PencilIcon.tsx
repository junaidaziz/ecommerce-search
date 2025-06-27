import React from 'react';
import type { IconProps } from './IconProps';

const PencilIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', ...rest }) => (
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
      d="M16.862 3.487a2.092 2.092 0 0 1 2.955 2.956L8.354 17.906l-4.24 1.06 1.06-4.24 11.688-11.24Z"
    />
  </svg>
);

export default PencilIcon;
