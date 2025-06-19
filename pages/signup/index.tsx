import Link from 'next/link';

export default function Signup() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Choose Signup Type</h1>
      <Link href="/signup/user" className="btn btn-primary w-full">
        User Signup
      </Link>
      <Link href="/signup/brand" className="btn btn-secondary w-full">
        Brand Signup
      </Link>
    </div>
  );
}
