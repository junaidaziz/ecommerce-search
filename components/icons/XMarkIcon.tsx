import React from 'react';
import type { IconProps } from './IconProps';

const XMarkIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', ...rest }) => (
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default XMarkIcon;
