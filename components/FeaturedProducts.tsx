import Image from 'next/image';

interface FeaturedProduct {
  id: number;
  name: string;
  price: string;
  image: string;
}

const products: FeaturedProduct[] = [
  {
    id: 1,
    name: 'Casual Shoes',
    price: '$59.99',
    image:
      'https://images.unsplash.com/photo-1528701800489-20cb7128fd4c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    name: 'Leather Tote Bag',
    price: '$79.99',
    image:
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    name: 'Wireless Headphones',
    price: '$149.99',
    image:
      'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 4,
    name: 'Classic Watch',
    price: '$199.99',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
  },
];

const FeaturedProducts: React.FC = () => (
  <section className="py-12">
    <div className="max-w-screen-xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Featured Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="border border-base-300 rounded-lg overflow-hidden text-center bg-base-100"
          >
            <Image
              src={p.image}
              alt=""
              width={300}
              height={300}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 space-y-1">
              <h3 className="font-medium">{p.name}</h3>
              <p className="text-primary font-semibold">{p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedProducts;
