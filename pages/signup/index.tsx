import Link from 'next/link';

export default function Signup() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-4 -mt-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Choose Signup Type</h1>
      <Link href="/signup/user" className="btn btn-primary w-full">
        User Signup
      </Link>
      <Link href="/signup/brand" className="btn btn-secondary w-full">
        Brand Signup
      </Link>
      </div>
    </div>
  );
}
