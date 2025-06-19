import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-base-300 mt-12 py-8 text-base-content">
      <div className="max-w-screen-xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold mb-2">Organic Store</h3>
          <p className="text-sm text-gray-600">Quality products for healthy living.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/products">Products</Link></li>
            <li><Link href="/categories">Categories</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Newsletter</h4>
          <form className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <div className="join">
              <input type="email" placeholder="you@example.com" className="input input-bordered join-item" />
              <button type="submit" className="btn join-item">Subscribe</button>
            </div>
          </form>
        </div>
      </div>
    </footer>
  )
}
