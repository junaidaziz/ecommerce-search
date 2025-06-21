import { useState, useContext, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { components, OptionProps, SingleValueProps } from 'react-select';
import countryList from 'react-select-country-list';
import Flag from 'react-world-flags';
import { useForm, Controller } from 'react-hook-form';
import { AppContext } from '../../contexts/AppContext';
import { signIn } from 'next-auth/react';
import {
  TextInput,
  EmailInput,
  PasswordInput,
  Textarea,
  SelectDropdown,
} from '../../components/form-fields';
import GoogleIcon from '../../components/icons/GoogleIcon';
import GithubIcon from '../../components/icons/GithubIcon';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

type CountryOptionType = { label: string; value: string };

const CountryOption = (props: OptionProps<CountryOptionType, false>) => (
  <components.Option {...props}>
    <div className="flex items-center gap-2">
      <Flag code={props.data.value} style={{ width: 20, height: 15 }} />
      <span aria-label={props.data.label}>{props.data.label}</span>
    </div>
  </components.Option>
);

const CountrySingleValue = (props: SingleValueProps<CountryOptionType, false>) => (
  <components.SingleValue {...props}>
    <div className="flex items-center gap-2">
      <Flag code={props.data.value} style={{ width: 20, height: 15 }} />
      <span aria-label={props.data.label}>{props.data.label}</span>
    </div>
  </components.SingleValue>
);

export default function BrandSignup() {
  const router = useRouter();
  const { signup, user } = useContext(AppContext)!;
  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<{
    brandName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirm: string;
    phoneNumber: string;
    businessAddress: string;
    city: string;
    country: string;
    website: string;
    businessDescription: string;
    taxId: string;
    logo: FileList;
  }>();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [formError, setFormError] = useState('');
  const countryOptions = useMemo(
    () =>
      countryList()
        .getData()
        .map((c: { label: string; value: string }) => ({ label: `${c.label} (${c.value})`, value: c.value })),
    []
  );

  useEffect(() => {
    if (user) {
      if (user.role === 'brand') router.push('/brand/dashboard');
      else if (user.role === 'super-admin') router.push('/admin');
      else router.push('/user/dashboard');
    }
  }, [user, router]);

  const handleEmailBlur = async () => {
    const value = getValues('email');
    if (value && emailRegex.test(value)) {
      try {
        const res = await fetch(
          `/api/check-email?email=${encodeURIComponent(value)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            return 'Email already registered';
          }
        }
      } catch (_) {}
    }
    return true;
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
  };

  const handleConfirmBlur = () => {
    const password = getValues('password');
    const confirm = getValues('confirm');
    if (password && confirm && password !== confirm) {
      return 'Passwords do not match';
    }
    return true;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    if (
      !['image/png', 'image/jpeg'].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError('logo', { type: 'manual', message: 'Logo must be PNG/JPG and under 2MB' });
      return;
    }
    clearErrors('logo');
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const submit = async (values: any) => {
    setLoading(true);
    try {
      const {
        brandName,
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        businessAddress,
        city,
        country,
        website,
        businessDescription,
        taxId,
      } = values;
      const data = await signup<{ token: string }>('/api/signup/brand', {
        brandName,
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        businessAddress,
        city,
        country,
        website,
        businessDescription,
        taxId,
        logo: logoFile,
      });
      router.push(`/confirm/${data.token}`);
    } catch (e) {
      setFormError('Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const passwordValue = watch('password');
  const showPasswordHint =
    passwordFocused ||
    (passwordValue !== '' && !passwordRegex.test(passwordValue || ''));

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mt-10 border border-gray-200 rounded-lg shadow-sm p-6 bg-white w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Brand Sign Up</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          className="btn btn-lg w-full flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white rounded-lg"
          onClick={() => signIn('google')}
        >
          <GoogleIcon className="h-5 w-5" />
          Continue with Google
        </button>
        <button
          type="button"
          className="btn btn-lg w-full flex items-center justify-center gap-2 hover:bg-gray-800 hover:text-white rounded-lg"
          onClick={() => signIn('github')}
        >
          <GithubIcon className="h-5 w-5" />
          Continue with GitHub
        </button>
      </div>
      {formError && <div className="text-red-500 mb-2">{formError}</div>}
      <form id="brand-signup-form" onSubmit={handleSubmit(submit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <h2 className="text-xl font-semibold">Account Info</h2>
            <TextInput
              name="firstName"
              placeholder="First Name"
              required
              register={register}
              rules={{ required: 'firstName is required' }}
              error={errors.firstName?.message as string}
            />
            <TextInput
              name="lastName"
              placeholder="Last Name"
              required
              register={register}
              rules={{ required: 'lastName is required' }}
              error={errors.lastName?.message as string}
            />
            <EmailInput
              name="email"
              placeholder="Email"
              required
              register={register}
              rules={{
                required: 'Email is required',
                pattern: { value: emailRegex, message: 'Invalid email format' },
                validate: handleEmailBlur,
              }}
              error={errors.email?.message as string}
            />
            <div className="space-y-5">
              <PasswordInput
                name="password"
                aria-describedby="password-help"
                placeholder="Password"
                required
                register={register}
                rules={{
                  required: 'Password is required',
                  pattern: {
                    value: passwordRegex,
                    message:
                      'Password must be at least 8 characters and include uppercase, lowercase, number and special character',
                  },
                  onBlur: handlePasswordBlur,
                }}
                onFocus={handlePasswordFocus}
                error={errors.password?.message as string}
              />
              <PasswordInput
                name="confirm"
                placeholder="Confirm Password"
                required
                register={register}
                rules={{ validate: handleConfirmBlur }}
                error={errors.confirm?.message as string}
              />
              {showPasswordHint && (
                <p id="password-help" className="text-sm text-gray-500">
                  Password must be at least 8 characters and include uppercase,
                  lowercase, number and special character
                </p>
              )}
            </div>
          </div>
          <div className="space-y-5">
            <h2 className="text-xl font-semibold">Business Info</h2>
            <TextInput
              name="brandName"
              placeholder="Brand Name"
              required
              register={register}
              rules={{ required: 'brandName is required' }}
              error={errors.brandName?.message as string}
            />
            <TextInput
              name="phoneNumber"
              placeholder="Phone Number"
              required
              register={register}
              rules={{ required: 'phoneNumber is required' }}
              error={errors.phoneNumber?.message as string}
            />
            <TextInput
              name="businessAddress"
              placeholder="Business Address"
              required
              register={register}
              rules={{ required: 'businessAddress is required' }}
              error={errors.businessAddress?.message as string}
            />
            <div className="space-y-5">
              <div>
                <TextInput
                  name="city"
                  placeholder="City"
                  required
                  register={register}
                  rules={{ required: 'city is required' }}
                  error={errors.city?.message as string}
                />
              </div>
              <div>
                <SelectDropdown
                  name="country"
                  control={control}
                  options={countryOptions}
                  placeholder="Country"
                  components={{ Option: CountryOption, SingleValue: CountrySingleValue }}
                  rules={{ required: 'country is required' }}
                  error={errors.country?.message as string}
                />
              </div>
            </div>

          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <TextInput
              name="website"
              placeholder="Website"
              register={register}
              error={errors.website?.message as string}
            />
            <TextInput
              name="taxId"
              placeholder="Tax ID"
              register={register}
              error={errors.taxId?.message as string}
            />
          </div>
          <div className="space-y-5">
            <Textarea
              name="businessDescription"
              placeholder="Business Description"
              register={register}
              error={errors.businessDescription?.message as string}
            />
            <div>
              <label className="block text-sm mb-1">Logo</label>
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Preview"
                  width={96}
                  height={96}
                  className="h-24 w-24 object-cover mb-2 rounded"
                />
              ) : (
                <div className="h-24 w-24 border border-dashed flex items-center justify-center text-gray-400 mb-2 rounded">
                  No logo
                </div>
              )}
              <input
                name="logo"
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleLogoChange}
                className="file-input file-input-bordered w-full rounded-lg mt-2"
              />
              {errors.logo && (
                <p className="text-red-500 text-sm">{errors.logo.message as string}</p>
              )}
            </div>
          </div>
        </div>
        <button
          className="btn btn-primary w-full mt-8"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Brand Account'}
        </button>
      </form>
      <p className="text-center mt-4">
        Already have an account?{' '}
        <Link href="/login" className="link">
          Login
        </Link>
      </p>
      <p className="text-sm text-center mt-4 text-gray-600">
        Not a brand?{' '}
        <Link href="/signup/user" className="text-blue-600 hover:underline">
          Sign up as a user instead
        </Link>
      </p>
      </div>
    </div>
  );
}
