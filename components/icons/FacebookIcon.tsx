import React from 'react';
import type { IconProps } from './IconProps';

const FacebookIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  ...rest
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
    aria-hidden="true"
    role="img"
    {...rest}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.993 4.388 10.955 10.125 11.854v-8.385H7.078v-3.47h3.047V9.845c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.953.925-1.953 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.028 24 18.065 24 12.073z" />
  </svg>
);

export default FacebookIcon;
