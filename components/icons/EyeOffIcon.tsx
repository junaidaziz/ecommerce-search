import React from 'react';
import type { IconProps } from './IconProps';

const EyeOffIcon: React.FC<IconProps> = ({
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
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.965 9.965 0 012.652-4.304m3.821-2.338A9.953 9.953 0 0112 5c4.478 0 8.269 2.943 9.543 7a9.952 9.952 0 01-.46 1.08M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1.259 4.75L5.21 5.21"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3l18 18"
    />
  </svg>
);

export default EyeOffIcon;
