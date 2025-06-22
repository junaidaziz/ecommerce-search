import Link from 'next/link';
import Image from 'next/image';
import type { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import VisaIcon from './icons/VisaIcon';
import MastercardIcon from './icons/MastercardIcon';
import PaypalIcon from './icons/PaypalIcon';

const Footer: FC = () => {
  type NewsletterForm = { email: string };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewsletterForm>();

  const submit: SubmitHandler<NewsletterForm> = (data) => {
    // TODO: send to newsletter API
    console.log(data);
  };
  return (
    <footer className="bg-base-300 mt-12 py-8 text-base-content px-4 sm:px-6 lg:px-8">
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Link href="/" className="inline-block mb-2">
            <Image src="/images/logo.png" alt="Logo" width={120} height={40} />
          </Link>
          <p className="text-sm text-gray-600">
            Everything you need, all in one place.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/products">Products</Link>
            </li>
            <li>
              <Link href="/categories">Categories</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Newsletter</h4>
          <form onSubmit={handleSubmit(submit)} className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <div className="join">
              <input
                type="email"
                placeholder="you@example.com"
                className="input input-bordered join-item"
                {...register('email', { required: 'Email is required' })}
              />
              <button type="submit" className="btn join-item">
                Subscribe
              </button>
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </form>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-4 pr-2">
        <VisaIcon size={32} color="#1A1F71" />
        <MastercardIcon size={32} color="#EB001B" />
        <PaypalIcon size={32} color="#003087" />
      </div>
    </footer>
  );
};

export default Footer;
