import { apiFetch } from '@lib/api';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput, Textarea, CountrySelect } from '@components/form-fields';
import { useContext } from 'react';
import { NotificationContext } from '@contexts/NotificationContext';
import ProfileAvatarUploader from '@components/ProfileAvatarUploader';
import Link from 'next/link';
import { brandSettingsSchema, type BrandSettingsFormData } from '@/lib/validation';

interface BrandFormValues {
  firstName: string;
  lastName: string;
  email: string;
  brandName: string;
  phoneNumber: string;
  businessAddress: string;
  city: string;
  country: string;
  website: string;
  businessDescription: string;
  taxId: string;
}

const BrandSettingsSection: React.FC = () => {
  const brandForm = useForm<BrandSettingsFormData>({
    resolver: zodResolver(brandSettingsSchema),
    mode: 'onBlur',
  });
  const { addNotification } = useContext(NotificationContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch('/api/brand/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        brandForm.reset({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          brandName: data.brandName || '',
          phoneNumber: data.phoneNumber || '',
          businessAddress: data.businessAddress || '',
          city: data.city || '',
          country: data.country || '',
          website: data.website || '',
          businessDescription: data.description || data.businessDescription || '',
          taxId: data.taxId || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [brandForm]);

  const submitBrand: SubmitHandler<BrandSettingsFormData> = async (values) => {
    // Split the values into profile and brand data
    const profileData = {
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber,
    };
    
    const brandData = {
      brandName: values.brandName,
      businessAddress: values.businessAddress,
      city: values.city,
      country: values.country,
      website: values.website,
      businessDescription: values.businessDescription,
      taxId: values.taxId,
    };

    // Update profile data first
    const profileRes = await apiFetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });

    // Update brand data
    const brandRes = await apiFetch('/api/brand/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brandData),
    });

    if (profileRes.ok && brandRes.ok) {
      addNotification('Brand settings updated successfully', 'success');
    } else {
      addNotification('Failed to update brand settings', 'error');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={brandForm.handleSubmit(submitBrand)}
      className="relative w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 flex flex-col gap-6"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Brand Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your brand profile, business information, and account details</p>
      </div>

      <div className="flex flex-col items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <ProfileAvatarUploader />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Upload your brand logo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <TextInput
          label="First Name"
          register={brandForm.register}
          name="firstName"
          error={brandForm.formState.errors.firstName?.message}
          placeholder="Enter your first name"
        />
        
        <TextInput
          label="Last Name"
          register={brandForm.register}
          name="lastName"
          error={brandForm.formState.errors.lastName?.message}
          placeholder="Enter your last name"
        />

        <div className="md:col-span-2">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <TextInput
                label="Email"
                register={brandForm.register}
                name="email"
                error={brandForm.formState.errors.email?.message}
                placeholder="Enter your email address"
                readOnly
              />
            </div>
            <div className="pb-4">
              <Link
                href={{ pathname: '/settings', query: { tab: 'email' } }}
                className="inline-flex items-center px-4 py-2.5 h-11 text-sm font-medium text-primary hover:text-white bg-primary/10 hover:bg-primary dark:bg-primary/20 dark:hover:bg-primary rounded-lg transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
              >
                Change Email
              </Link>
            </div>
          </div>
        </div>
        
        <TextInput
          label="Brand Name"
          register={brandForm.register}
          name="brandName"
          error={brandForm.formState.errors.brandName?.message}
          className="md:col-span-2"
          placeholder="Enter your brand name"
        />
        
        <TextInput
          label="Phone Number"
          register={brandForm.register}
          name="phoneNumber"
          error={brandForm.formState.errors.phoneNumber?.message}
          placeholder="Enter contact phone number"
        />

        <TextInput
          label="Website"
          register={brandForm.register}
          name="website"
          error={brandForm.formState.errors.website?.message}
          placeholder="https://www.yourbrand.com"
        />

        <TextInput
          label="Business Address"
          register={brandForm.register}
          name="businessAddress"
          error={brandForm.formState.errors.businessAddress?.message}
          className="md:col-span-2"
          placeholder="Enter your business address"
        />

        <TextInput
          label="City"
          register={brandForm.register}
          name="city"
          error={brandForm.formState.errors.city?.message}
          placeholder="Enter city"
        />

        <CountrySelect
          label="Country"
          control={brandForm.control}
          name="country"
          error={brandForm.formState.errors.country?.message}
        />

        <TextInput
          label="Tax ID"
          register={brandForm.register}
          name="taxId"
          error={brandForm.formState.errors.taxId?.message}
          className="md:col-span-2"
          placeholder="Enter tax identification number"
        />

        <div className="md:col-span-2">
          <Textarea
            label="Business Description"
            register={brandForm.register}
            name="businessDescription"
            error={brandForm.formState.errors.businessDescription?.message}
            placeholder="Describe your brand and business..."
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          type="submit"
          className="px-8 py-3 text-base font-semibold text-white bg-primary hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-light rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
        >
          Save Settings
        </button>
      </div>
    </form>
  );
};

export default BrandSettingsSection;
