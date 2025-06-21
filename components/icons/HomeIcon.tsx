import React from 'react';
import type { IconProps } from './IconProps';

const HomeIcon: React.FC<IconProps> = ({
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
      d="M3 9.75 12 3l9 6.75V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.75z"
    />
  </svg>
);

export default HomeIcon;
