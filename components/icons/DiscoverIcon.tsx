import React from 'react';
import type { IconProps } from './IconProps';

const DiscoverIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  ...rest
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    role="img"
    {...rest}
  >
    <rect x="0" y="4" width="24" height="16" rx="2" fill="#F47216" />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fontSize="7"
      fontWeight="bold"
      fill="white"
    >
      DISC
    </text>
  </svg>
);

export default DiscoverIcon;
