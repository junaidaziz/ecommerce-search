import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppContext } from '../../contexts/AppContext';
import { signIn } from 'next-auth/react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function BrandSignup() {
  const router = useRouter();
  const { signup, user } = useContext(AppContext);
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
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

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
      } catch (_) {}
    }
  };

  const handlePasswordBlur = () => {
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

  return (
    <div className="p-6 max-w-6xl mx-auto bg-slate-100 shadow-lg rounded-lg fade-in">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Brand Sign Up</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          className="btn btn-lg w-full flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white rounded-lg"
          onClick={() => signIn('google')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5"
          >
            <path
              fill="currentColor"
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.362 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            />
          </svg>
          Continue with Google
        </button>
        <button
          type="button"
          className="btn btn-lg w-full flex items-center justify-center gap-2 hover:bg-gray-800 hover:text-white rounded-lg"
          onClick={() => signIn('github')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5"
          >
            <path
              fill="currentColor"
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.77.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.812 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            />
          </svg>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input input-bordered w-full pr-10 rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.password ? 'border-red-500' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={handlePasswordBlur}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.965 9.965 0 012.652-4.304m3.821-2.338A9.953 9.953 0 0112 5c4.478 0 8.269 2.943 9.543 7a9.952 9.952 0 01-.46 1.08M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1.259 4.75L5.21 5.21"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
                <p className="text-sm text-gray-500">
                  Password must be at least 8 characters and include uppercase,
                  lowercase, number and special character
                </p>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.965 9.965 0 012.652-4.304m3.821-2.338A9.953 9.953 0 0112 5c4.478 0 8.269 2.943 9.543 7a9.952 9.952 0 01-.46 1.08M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1.259 4.75L5.21 5.21"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
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
            <div className="grid grid-cols-2 gap-4">
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
                <input
                  name="country"
                  className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.country ? 'border-red-500' : ''}`}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
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
                <img
                  src={logoPreview}
                  alt="Preview"
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
          className="btn btn-primary w-full mt-8 rounded-lg hover:opacity-90"
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
    </div>
  );
}
