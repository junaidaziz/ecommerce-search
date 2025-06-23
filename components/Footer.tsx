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
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="inline-block cursor-pointer transition-transform duration-300 ease-out hover:scale-110 hover:shadow-lg hover:rotate-1">
            <Image
              src="/images/logo-medium.png"
              alt="Logo"
              width={120}
              height={40}
              className="mb-2 max-h-10 w-auto"
              priority
            />
          </Link>
          <p className="text-sm text-gray-600">
            Everything you need, all in one place.
          </p>
          <div className="mt-4 text-sm space-y-1">
            <p>123 Market Street, London</p>
            <p>
              <a href="mailto:info@shopverse.com" className="link">
                info@shopverse.com
              </a>
            </p>
            <p>+44 1234 567890</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Useful Links</h4>
          <ul className="space-y-1">
            <li>
              <Link href="/shipping">Shipping</Link>
            </li>
            <li>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
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
        <div className="flex items-end justify-end gap-4">
          <VisaIcon size={36} className="text-blue-600 cursor-pointer" />
          <MastercardIcon size={36} className="cursor-pointer" />
          <PaypalIcon size={36} className="text-blue-500 cursor-pointer" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
