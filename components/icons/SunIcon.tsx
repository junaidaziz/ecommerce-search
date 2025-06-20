import React from 'react';
import type { IconProps } from './IconProps';

const SunIcon: React.FC<IconProps> = ({
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
    <path d="M5.64 17.657l-1.414 1.414m0-13.242l1.414 1.414M12 3v2m0 14v2m7-9h2M3 12H1m15.364 5.657l1.414 1.414M6.343 6.343L4.929 4.929" />
    <circle cx="12" cy="12" r="5" />
  </svg>
);

export default SunIcon;
