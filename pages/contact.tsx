import Head from 'next/head';
import { useForm, SubmitHandler } from 'react-hook-form';
import { getPageTitle } from '@lib/pageTitle';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>();

  const submit: SubmitHandler<ContactForm> = (data) => {
    // TODO: send data to backend
    console.log(data);
    reset();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Head>
        <title>{getPageTitle('Contact')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <div className="space-y-1 text-sm">
        <p>123 Market Street, London</p>
        <p>
          <a href="mailto:info@shopverse.com" className="link">
            info@shopverse.com
          </a>
        </p>
        <p>+44 1234 567890</p>
      </div>
      <form onSubmit={handleSubmit(submit)} className="space-y-2">
        <input
          type="text"
          placeholder="Your name"
          className="input input-bordered w-full"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
        <input
          type="email"
          placeholder="Your email"
          className="input input-bordered w-full"
          {...register('email', { required: 'Email is required' })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
        <textarea
          placeholder="Your message"
          className="textarea textarea-bordered w-full"
          rows={4}
          {...register('message', { required: 'Message is required' })}
        ></textarea>
        {errors.message && (
          <p className="text-red-500 text-sm">{errors.message.message}</p>
        )}
        <button type="submit" className="btn btn-primary">
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactPage;
