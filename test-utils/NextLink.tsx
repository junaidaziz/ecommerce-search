import type { PropsWithChildren } from 'react';

interface LinkProps {
  href: string;
}

export default function Link({ href, children }: PropsWithChildren<LinkProps>) {
  return <a href={href}>{children}</a>;
}
