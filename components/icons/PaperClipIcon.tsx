import React from 'react';
import type { IconProps } from './IconProps';

const PaperClipIcon: React.FC<IconProps> = ({
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
    strokeWidth={1.5}
    className={className}
    aria-hidden="true"
    role="img"
    {...rest}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.44 11.05l-8.49 8.49a5.25 5.25 0 01-7.42-7.42l8.49-8.49a3.75 3.75 0 015.3 5.3l-8.49 8.49a2.25 2.25 0 01-3.18-3.18l7.79-7.79"
    />
  </svg>
);

export default PaperClipIcon;
