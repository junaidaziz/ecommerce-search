import React from 'react';
import type { IconProps } from './IconProps';

const PlusIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', ...rest }) => (
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

export default PlusIcon;
