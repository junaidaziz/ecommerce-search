import type { GetServerSideProps } from 'next';
import BrandProductsPage from '@components/brand/BrandProductsPage';

export default BrandProductsPage;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
