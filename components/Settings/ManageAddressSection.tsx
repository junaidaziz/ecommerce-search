import { useState, useEffect, useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TextInput, CountrySelect } from '@components/form-fields';
import { NotificationContext } from '@contexts/NotificationContext';
import countries from '../../data/countries';

interface AddressFormValues {
  address: string;
  city: string;
  country: {
    label: string;
    value: string;
    callingCode: string;
  } | null;
}

const ManageAddressSection: React.FC = () => {
  const addressForm = useForm<AddressFormValues>();
  const { addNotification } = useContext(NotificationContext);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        addressForm.reset({
          address: data.address || '',
          city: data.city || '',
          country: countries.find((c) => c.value === data.country) || null,
        });
      })
      .catch(() => {});
  }, [addressForm]);

  const submitAddress: SubmitHandler<AddressFormValues> = async (values) => {
    setSavingAddress(true);
    const payload = {
      address: values.address,
      city: values.city,
      country: values.country?.value || '',
    };
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) addNotification('Address updated', 'success');
    else addNotification('Update failed', 'error');
    setSavingAddress(false);
  };

  return (
    <form onSubmit={addressForm.handleSubmit(submitAddress)} className="space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Manage Address</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Address"
          placeholder="123 Main St"
          register={addressForm.register}
          name="address"
          rules={{ required: 'Required' }}
          error={addressForm.formState.errors.address?.message}
        />
        <TextInput
          label="City"
          placeholder="New York"
          register={addressForm.register}
          name="city"
          rules={{ required: 'Required' }}
          error={addressForm.formState.errors.city?.message}
        />
        <div className="md:col-span-2">
          <CountrySelect
            label="Country"
            name="country"
            control={addressForm.control}
            rules={{ required: 'Required' }}
            error={addressForm.formState.errors.country?.message as string}
          />
        </div>
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={savingAddress}>
        {savingAddress ? 'Saving...' : 'Save Address'}
      </button>
    </form>
  );
};

export default ManageAddressSection;
