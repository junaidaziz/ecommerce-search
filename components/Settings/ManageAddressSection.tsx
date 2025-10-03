import { apiFetch } from '@lib/api';
import { useState, useEffect, useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TextInput, CountrySelect } from '@components/form-fields';
import { NotificationContext } from '@contexts/NotificationContext';
import { MapPinIcon, CheckIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface AddressFormValues {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  type: 'SHIPPING' | 'BILLING';
  isDefault: boolean;
}

interface Address extends AddressFormValues {
  id: number;
  uuid: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

const ManageAddressSection: React.FC = () => {
  const addressForm = useForm<AddressFormValues>({
    defaultValues: {
      type: 'SHIPPING',
      isDefault: false,
    },
  });
  const { addNotification } = useContext(NotificationContext);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadAddresses = async () => {
    try {
      const res = await apiFetch('/api/user/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const submitAddress: SubmitHandler<AddressFormValues> = async (values) => {
    setSavingAddress(true);
    try {
      const url = editingId
        ? `/api/user/addresses?id=${editingId}`
        : '/api/user/addresses';
      const method = editingId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        addNotification(
          editingId ? 'Address updated' : 'Address added',
          'success'
        );
        addressForm.reset({
          type: 'SHIPPING',
          isDefault: false,
        });
        setEditingId(null);
        setShowForm(false);
        await loadAddresses();
      } else {
        addNotification('Failed to save address', 'error');
      }
    } catch (error) {
      addNotification('Failed to save address', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    addressForm.reset({
      fullName: address.fullName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phoneNumber: address.phoneNumber || '',
      type: address.type,
      isDefault: address.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const res = await apiFetch(`/api/user/addresses?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        addNotification('Address deleted', 'success');
        await loadAddresses();
      } else {
        addNotification('Failed to delete address', 'error');
      }
    } catch (error) {
      addNotification('Failed to delete address', 'error');
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    addressForm.reset({
      type: 'SHIPPING',
      isDefault: false,
    });
    setShowForm(true);
  };

  const shippingAddresses = addresses.filter((a) => a.type === 'SHIPPING');
  const billingAddresses = addresses.filter((a) => a.type === 'BILLING');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
              <MapPinIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manage Addresses
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your shipping and billing addresses
              </p>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-light rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add New
          </button>
        </div>

        {/* Address Form */}
        {showForm && (
          <form
            onSubmit={addressForm.handleSubmit(submitAddress)}
            className="space-y-5 mb-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? 'Edit Address' : 'New Address'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>

            {/* Type Selection */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  {...addressForm.register('type')}
                  value="SHIPPING"
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Shipping Address
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  {...addressForm.register('type')}
                  value="BILLING"
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Billing Address
                </span>
              </label>
            </div>

            <TextInput
              label="Full Name"
              placeholder="John Doe"
              register={addressForm.register}
              name="fullName"
              rules={{ required: 'Required' }}
              error={addressForm.formState.errors.fullName?.message}
            />

            <TextInput
              label="Address Line 1"
              placeholder="123 Main St"
              register={addressForm.register}
              name="addressLine1"
              rules={{ required: 'Required' }}
              error={addressForm.formState.errors.addressLine1?.message}
            />

            <TextInput
              label="Address Line 2 (Optional)"
              placeholder="Apt, Suite, Unit, Building, Floor, etc."
              register={addressForm.register}
              name="addressLine2"
              error={addressForm.formState.errors.addressLine2?.message}
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
                label="State/Province"
                placeholder="NY"
                register={addressForm.register}
                name="state"
                rules={{ required: 'Required' }}
                error={addressForm.formState.errors.state?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Postal Code"
                placeholder="10001"
                register={addressForm.register}
                name="postalCode"
                rules={{ required: 'Required' }}
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

            <TextInput
              label="Phone Number (Optional)"
              placeholder="+1 234 567 8900"
              register={addressForm.register}
              name="phoneNumber"
              error={addressForm.formState.errors.phoneNumber?.message}
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...addressForm.register('isDefault')}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Set as default address
              </span>
            </label>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-light rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                disabled={savingAddress}
              >
                {savingAddress ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    {editingId ? 'Update' : 'Save'} Address
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Shipping Addresses */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Shipping Addresses
        </h3>
        {shippingAddresses.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No shipping addresses saved yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shippingAddresses.map((address) => (
              <div
                key={address.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  address.isDefault
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                {address.isDefault && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-primary bg-primary/20 rounded-full mb-2">
                    DEFAULT
                  </span>
                )}
                <p className="font-semibold text-gray-900 dark:text-white">
                  {address.fullName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {address.addressLine1}
                </p>
                {address.addressLine2 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {address.addressLine2}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {address.country}
                </p>
                {address.phoneNumber && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {address.phoneNumber}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(address)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-primary hover:text-white bg-primary/10 hover:bg-primary dark:bg-primary/20 dark:hover:bg-primary rounded transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <PencilIcon className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-white bg-red-50 hover:bg-red-600 dark:bg-red-900/20 dark:hover:bg-red-600 rounded transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Billing Addresses */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Billing Addresses
        </h3>
        {billingAddresses.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No billing addresses saved yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {billingAddresses.map((address) => (
              <div
                key={address.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  address.isDefault
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                {address.isDefault && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-primary bg-primary/20 rounded-full mb-2">
                    DEFAULT
                  </span>
                )}
                <p className="font-semibold text-gray-900 dark:text-white">
                  {address.fullName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {address.addressLine1}
                </p>
                {address.addressLine2 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {address.addressLine2}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {address.country}
                </p>
                {address.phoneNumber && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {address.phoneNumber}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(address)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-primary hover:text-white bg-primary/10 hover:bg-primary dark:bg-primary/20 dark:hover:bg-primary rounded transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <PencilIcon className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-white bg-red-50 hover:bg-red-600 dark:bg-red-900/20 dark:hover:bg-red-600 rounded transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAddressSection;
