import Image from 'next/image'
import Link from 'next/link'
import type { FC } from 'react'

const Hero: FC = () => {
  return (
    <section className="bg-green-50 rounded-lg overflow-hidden flex flex-col md:flex-row items-center p-6 md:p-12">
      <div className="flex-1 text-center md:text-left space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">Welcome to Our Store</h1>
        <p className="text-lg text-gray-600">Discover the best products carefully curated for you.</p>
        <Link href="/products" className="btn btn-primary">Shop Now</Link>
      </div>
      <div className="flex-1 mt-6 md:mt-0 md:ml-6">
        <Image src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80" alt="" width={600} height={400} className="rounded-lg object-cover w-full h-64 md:h-full" />
      </div>
    </section>
  )
}

export default Hero
