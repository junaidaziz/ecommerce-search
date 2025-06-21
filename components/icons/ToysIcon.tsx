import React from 'react';
import type { IconProps } from './IconProps';

const ToysIcon: React.FC<IconProps> = ({
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
      d="M12 17a5 5 0 1 0-5-5m0 0a5 5 0 1 0 5 5m-5-5h10"
    />
  </svg>
);

export default ToysIcon;
