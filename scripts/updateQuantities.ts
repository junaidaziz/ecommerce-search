import { prisma } from '../lib/prisma';
import { loadAndIndexProducts } from '../lib/products';

async function main() {
  const products = await prisma.product.findMany({ select: { id: true } });
  for (const product of products) {
    const qty = Math.floor(Math.random() * 20);
    await prisma.product.update({
      where: { id: product.id },
      data: { quantity: qty },
    });
  }
  try {
    const { products: all } = await loadAndIndexProducts();
    console.log(`Updated and re-indexed ${all.length} products`);
  } catch (err) {
    console.error('Failed to re-index products', err);
  }
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
