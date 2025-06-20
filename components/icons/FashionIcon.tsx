import React from 'react';
import type { IconProps } from './IconProps';

const FashionIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  ...rest
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    className={className}
    aria-hidden="true"
    role="img"
    {...rest}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 7l8-4 8 4M4 7v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7M4 7l8 4 8-4"
    />
  </svg>
);

export default FashionIcon;
