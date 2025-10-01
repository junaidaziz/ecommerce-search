import { apiFetch } from '@lib/api';
import { useState, useEffect, useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TextInput, CountrySelect } from '@components/form-fields';
import { NotificationContext } from '@contexts/NotificationContext';
import { MapPinIcon, CheckIcon } from '@heroicons/react/24/outline';

interface AddressFormValues {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const ManageAddressSection: React.FC = () => {
  const addressForm = useForm<AddressFormValues>();
  const { addNotification } = useContext(NotificationContext);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    apiFetch('/api/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        addressForm.reset({
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          postalCode: data.postalCode || '',
          country: data.country || '',
        });
      })
      .catch(() => {});
  }, [addressForm]);

  const submitAddress: SubmitHandler<AddressFormValues> = async (values) => {
    setSavingAddress(true);
    const payload = {
      address: values.address,
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      country: values.country,
    };
    const res = await apiFetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) addNotification('Address updated', 'success');
    else addNotification('Update failed', 'error');
    setSavingAddress(false);
  };

  return (
    <form
      onSubmit={addressForm.handleSubmit(submitAddress)}
      className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8"
    >
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
          <MapPinIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Address</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Update your shipping address</p>
        </div>
      </div>
      
      <div className="space-y-5">
        <TextInput
          label="Address"
          placeholder="123 Main St"
          register={addressForm.register}
          name="address"
          rules={{ required: 'Required' }}
          error={addressForm.formState.errors.address?.message}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="City"
            placeholder="New York"
            register={addressForm.register}
            name="city"
            rules={{ required: 'Required' }}
            error={addressForm.formState.errors.city?.message}
          />
          <TextInput
            label="State"
            placeholder="CA"
            register={addressForm.register}
            name="state"
            error={addressForm.formState.errors.state?.message}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Postal Code"
            placeholder="90210"
            register={addressForm.register}
            name="postalCode"
            error={addressForm.formState.errors.postalCode?.message}
          />
          <div>
            <CountrySelect
              label="Country"
              name="country"
              control={addressForm.control}
              rules={{ required: 'Required' }}
              error={addressForm.formState.errors.country?.message as string}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800 mt-6">
        <button
          type="submit"
          className="px-8 py-3 text-base font-semibold text-white bg-success hover:bg-success-dark dark:bg-success dark:hover:bg-success-light rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center gap-2"
          disabled={savingAddress}
        >
          {savingAddress ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckIcon className="w-5 h-5" />
              Save Address
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ManageAddressSection;
