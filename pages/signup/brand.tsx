import { useState, useContext, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Select, { components, OptionProps, SingleValueProps } from 'react-select';
import countryList from 'react-select-country-list';
import Flag from 'react-world-flags';
import { AppContext } from '../../contexts/AppContext';
import { signIn } from 'next-auth/react';
import GoogleIcon from '../../components/icons/GoogleIcon';
import GithubIcon from '../../components/icons/GithubIcon';
import EyeIcon from '../../components/icons/EyeIcon';
import EyeOffIcon from '../../components/icons/EyeOffIcon';

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
  const [brandName, setBrandName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [taxId, setTaxId] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState({});
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
    setErrors((prev) => {
      const next = { ...prev };
      if (email && !emailRegex.test(email)) {
        next.email = 'Invalid email format';
      } else if (
        next.email === 'Invalid email format' ||
        next.email === 'Email already registered'
      ) {
        delete next.email;
      }
      return next;
    });
    if (email && emailRegex.test(email)) {
      try {
        const res = await fetch(
          `/api/check-email?email=${encodeURIComponent(email)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setErrors((prev) => ({
              ...prev,
              email: 'Email already registered',
            }));
          }
        }
      } catch (_) { }
    }
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    setErrors((prev) => {
      const next = { ...prev };
      if (password && !passwordRegex.test(password)) {
        next.password =
          'Password must be at least 8 characters and include uppercase, lowercase, number and special character';
      } else if (next.password && next.password.startsWith('Password must')) {
        delete next.password;
      }
      if (confirm && password !== confirm) {
        next.confirm = 'Passwords do not match';
      } else if (next.confirm === 'Passwords do not match') {
        delete next.confirm;
      }
      return next;
    });
  };

  const handleConfirmBlur = () => {
    setErrors((prev) => {
      const next = { ...prev };
      if (password && confirm && password !== confirm) {
        next.confirm = 'Passwords do not match';
      } else if (next.confirm === 'Passwords do not match') {
        delete next.confirm;
      }
      return next;
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    if (
      !['image/png', 'image/jpeg'].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setErrors((prev) => ({
        ...prev,
        logo: 'Logo must be PNG/JPG and under 2MB',
      }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      if (next.logo) delete next.logo;
      return next;
    });
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!brandName) newErrors.brandName = 'Brand name is required';
    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (!confirm) newErrors.confirm = 'Confirm password is required';
    if (!phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!businessAddress)
      newErrors.businessAddress = 'Business address is required';
    if (!city) newErrors.city = 'City is required';
    if (!country) newErrors.country = 'Country is required';
    if (password && confirm && password !== confirm) {
      newErrors.confirm = 'Passwords do not match';
    }
    if (logoFile && !['image/png', 'image/jpeg'].includes(logoFile.type)) {
      newErrors.logo = 'Logo must be PNG or JPG';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      document.querySelector(`[name="${firstKey}"]`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    setLoading(true);

    try {
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
    passwordFocused || (password !== '' && !passwordRegex.test(password));

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
            <input
              name="firstName"
              className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.firstName ? 'border-red-500' : ''}`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName}</p>
            )}
            <input
              name="lastName"
              className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.lastName ? 'border-red-500' : ''}`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName}</p>
            )}
            <input
              name="email"
              className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.email ? 'border-red-500' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="Email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
            <div className="space-y-5">
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input input-bordered w-full pr-10 rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.password ? 'border-red-500' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  aria-describedby="password-help"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                {showPasswordHint && (
                  <p id="password-help" className="text-sm text-gray-500 mt-1">
                    Password must be at least 8 characters and include uppercase,
                    lowercase, number and special character
                  </p>
                )}
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>
              <div className="relative">
                <input
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className={`input input-bordered w-full pr-10 rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.confirm ? 'border-red-500' : ''}`}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onBlur={handleConfirmBlur}
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                {errors.confirm && (
                  <p className="text-red-500 text-sm">{errors.confirm}</p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <h2 className="text-xl font-semibold">Business Info</h2>
            <input
              name="brandName"
              className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.brandName ? 'border-red-500' : ''}`}
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Brand Name"
            />
            {errors.brandName && (
              <p className="text-red-500 text-sm">{errors.brandName}</p>
            )}
            <input
              name="phoneNumber"
              className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.phoneNumber ? 'border-red-500' : ''}`}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone Number"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
            )}
            <input
              name="businessAddress"
              className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.businessAddress ? 'border-red-500' : ''}`}
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="Business Address"
            />
            {errors.businessAddress && (
              <p className="text-red-500 text-sm">{errors.businessAddress}</p>
            )}
            <div className="space-y-5">
              <div>
                <input
                  name="city"
                  className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.city ? 'border-red-500' : ''}`}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm">{errors.city}</p>
                )}
              </div>
              <div>
                <Select
                  name="country"
                  options={countryOptions}
                  value={country ? countryOptions.find((c) => c.label === country) : null}
                  onChange={(option) => setCountry(option?.label || '')}
                  placeholder="Country"
                  className="w-full"
                  classNamePrefix="react-select"
                  components={{ Option: CountryOption, SingleValue: CountrySingleValue }}
                />
                {errors.country && (
                  <p className="text-red-500 text-sm">{errors.country}</p>
                )}
              </div>
            </div>

          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <input
              name="website"
              className="input input-bordered w-full rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Website"
            />
            <input
              name="taxId"
              className="input input-bordered w-full rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="Tax ID"
            />
          </div>
          <div className="space-y-5">
            <textarea
              name="businessDescription"
              className="textarea textarea-bordered w-full rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
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
              {errors.logo && (
                <p className="text-red-500 text-sm">{errors.logo}</p>
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
