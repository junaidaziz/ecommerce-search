import { prisma } from '@lib/prisma';
import { loadAndIndexProducts } from '@lib/products';

async function main() {
  const email = process.env.BRAND_EMAIL || 'junaid@gmail.com';
  const brand = await prisma.user.findUnique({ where: { email } });
  if (!brand) {
    throw new Error(`Brand with email ${email} not found`);
  }

  const result = await prisma.product.updateMany({
    data: { vendorId: brand.id },
  });
  console.log(`Updated ${result.count} products to brand ${email}`);

  try {
    const { products } = await loadAndIndexProducts();
    console.log(`Re-indexed ${products.length} products`);
  } catch (err) {
    console.error('Failed to re-index products', err);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
