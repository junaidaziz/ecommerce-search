export const SITE_NAME = 'Product Search App';
export function getPageTitle(page: string): string {
  return page ? `${page} - ${SITE_NAME}` : SITE_NAME;
}
