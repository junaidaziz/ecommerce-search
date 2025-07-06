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
      className="max-w-lg mx-auto bg-base-100 rounded-2xl shadow-lg p-8 mt-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-full">
          <MapPinIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Manage Address</h2>
          <p className="text-sm text-gray-600">Update your shipping address</p>
        </div>
      </div>
      
      <div className="space-y-4">
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
      
      <button
        type="submit"
        className="btn btn-primary w-full mt-6 shadow-lg"
        disabled={savingAddress}
      >
        {savingAddress ? (
          <>
            <div className="loading loading-spinner loading-sm"></div>
            Saving...
          </>
        ) : (
          <>
            <CheckIcon className="w-4 h-4" />
            Save Address
          </>
        )}
      </button>
    </form>
  );
};

export default ManageAddressSection;
