import { useState, useContext, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { components, OptionProps, SingleValueProps } from 'react-select';
import countryList from 'react-select-country-list';
import Flag from 'react-world-flags';
import { useFormState } from 'react-use-form-state';
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
  const [formState, inputs] = useFormState({
    brandName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirm: '',
    phoneNumber: '',
    businessAddress: '',
    city: '',
    country: '',
    website: '',
    businessDescription: '',
    taxId: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [formError, setFormError] = useState('');
  const countryOptions = useMemo(
    () =>
      countryList()
        .getData()
        .map((c) => ({ label: `${c.label} (${c.value})`, value: c.value })),
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
    const value = formState.values.email;
    if (value && emailRegex.test(value)) {
      try {
        const res = await fetch(
          `/api/check-email?email=${encodeURIComponent(value)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            formState.setFieldError('email', 'Email already registered');
          }
        }
      } catch (_) {}
    }
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
  };

  const handleConfirmBlur = () => {
    if (
      formState.values.password &&
      formState.values.confirm &&
      formState.values.password !== formState.values.confirm
    ) {
      formState.setFieldError('confirm', 'Passwords do not match');
    }
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
      formState.setFieldError('logo', 'Logo must be PNG/JPG and under 2MB');
      return;
    }
    formState.setFieldError('logo', undefined as any);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleEmailBlur();
    const values = formState.values;
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      'brandName',
      'firstName',
      'lastName',
      'email',
      'password',
      'confirm',
      'phoneNumber',
      'businessAddress',
      'city',
      'country',
    ];
    requiredFields.forEach((f) => {
      if (!values[f]) newErrors[f] = `${f} is required`;
    });
    if (
      values.password &&
      values.confirm &&
      values.password !== values.confirm
    ) {
      newErrors.confirm = 'Passwords do not match';
    }
    if (logoFile && !['image/png', 'image/jpeg'].includes(logoFile.type)) {
      newErrors.logo = 'Logo must be PNG or JPG';
    }
    Object.entries(newErrors).forEach(([k, v]) =>
      formState.setFieldError(k, v)
    );
    if (Object.keys(newErrors).length > 0 || Object.keys(formState.errors).some((k) => formState.errors[k])) {
      const firstKey = Object.keys({ ...formState.errors, ...newErrors })[0];
      document.querySelector(`[name="${firstKey}"]`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

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
        // confirm not needed
      } = formState.values as any;
      const data = await signup('/api/signup/brand', {
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

  const showPasswordHint =
    passwordFocused ||
    (formState.values.password !== '' &&
      !passwordRegex.test(formState.values.password || ''));

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
      <form id="brand-signup-form" onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <h2 className="text-xl font-semibold">Account Info</h2>
            <TextInput
              field={inputs.text('firstName')}
              placeholder="First Name"
              required
              error={formState.errors.firstName as string}
            />
            <TextInput
              field={inputs.text('lastName')}
              placeholder="Last Name"
              required
              error={formState.errors.lastName as string}
            />
            <EmailInput
              field={inputs.email('email', {
                validate: (v) =>
                  v && !emailRegex.test(v) ? 'Invalid email format' : true,
                onBlur: handleEmailBlur,
                validateOnBlur: true,
              })}
              placeholder="Email"
              required
              error={formState.errors.email as string}
            />
            <div className="space-y-5">
              <PasswordInput
                field={inputs.password('password', {
                  validate: (v) =>
                    v && !passwordRegex.test(v)
                      ? 'Password must be at least 8 characters and include uppercase, lowercase, number and special character'
                      : true,
                  onFocus: handlePasswordFocus,
                  onBlur: handlePasswordBlur,
                  validateOnBlur: true,
                })}
                aria-describedby="password-help"
                placeholder="Password"
                required
                error={formState.errors.password as string}
              />
              <PasswordInput
                field={inputs.password('confirm', {
                  validate: (v, values) =>
                    values.password && v !== values.password
                      ? 'Passwords do not match'
                      : true,
                  onBlur: handleConfirmBlur,
                  validateOnBlur: true,
                })}
                placeholder="Confirm Password"
                required
                error={formState.errors.confirm as string}
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
              field={inputs.text('brandName')}
              placeholder="Brand Name"
              required
              error={formState.errors.brandName as string}
            />
            <TextInput
              field={inputs.text('phoneNumber')}
              placeholder="Phone Number"
              required
              error={formState.errors.phoneNumber as string}
            />
            <TextInput
              field={inputs.text('businessAddress')}
              placeholder="Business Address"
              required
              error={formState.errors.businessAddress as string}
            />
            <div className="space-y-5">
              <div>
                <TextInput
                  field={inputs.text('city')}
                  placeholder="City"
                  required
                  error={formState.errors.city as string}
                />
              </div>
              <div>
                <SelectDropdown
                  field={inputs.raw('country', {
                    onChange: (o: any) => o?.label || '',
                    touchOnChange: true,
                  })}
                  options={countryOptions}
                  value={
                    formState.values.country
                      ? countryOptions.find(
                          (c) => c.label === formState.values.country
                        ) || null
                      : null
                  }
                  placeholder="Country"
                  components={{ Option: CountryOption, SingleValue: CountrySingleValue }}
                  error={formState.errors.country as string}
                />
              </div>
            </div>

          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <TextInput
              field={inputs.text('website')}
              placeholder="Website"
            />
            <TextInput
              field={inputs.text('taxId')}
              placeholder="Tax ID"
            />
          </div>
          <div className="space-y-5">
            <Textarea
              field={inputs.textarea('businessDescription')}
              placeholder="Business Description"
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
              {formState.errors.logo && (
                <p className="text-red-500 text-sm">{formState.errors.logo as string}</p>
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
