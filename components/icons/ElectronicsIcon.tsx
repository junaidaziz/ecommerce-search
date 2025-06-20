import React from 'react';
import type { IconProps } from './IconProps';

const ElectronicsIcon: React.FC<IconProps> = ({
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
      d="M9 17v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2m-6 0V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0h6"
    />
  </svg>
);

export default ElectronicsIcon;
