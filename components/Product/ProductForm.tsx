import React, { useState, useContext, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import AsyncCreatableSelect from 'react-select/async-creatable';
import type { SelectOption } from '../form-fields/SelectDropdown';
import {
  TextInput,
  Textarea,
  FileUpload,
  Checkbox,
  TagInput,
} from '../form-fields';
import { VendorsResponse } from '../../types';

import { AppContext } from '@contexts/AppContext';
import type { ProductFormValues } from '../../types';

interface ProductFormProps {
  initial?: Partial<ProductFormValues>;
  onSubmit: (data: FormData) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  requestNewCategory?: (
    name: string
  ) => Promise<{ id: number | string; name: string } | undefined>;
  requestNewVendor?: (
    name: string
  ) => Promise<{ brandName: string } | undefined>;
  loading?: boolean;
  serverError?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  requestNewCategory,
  requestNewVendor,
  loading = false,
  serverError,
}) => {
  const { user } = useContext(AppContext) as {
    user: { brandName?: string } | null;
  };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    setFocus,
    watch,
  } = useForm<ProductFormValues>({
    defaultValues: {
      id:
        initial?.id ||
        (typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : String(Date.now())),
      vendor: initial?.vendor || '',
      sku: initial?.sku || '',
      title: initial?.title || '',
      description: initial?.description || '',
      productType: initial?.productType || '',
      tags: initial?.tags ? initial.tags : [],
      categoryId: initial?.categoryId ? String(initial.categoryId) : '',
      quantity: initial?.quantity ?? 0,
      minPrice: initial?.minPrice ?? 0,
      maxPrice: initial?.maxPrice ?? 0,
      currency: initial?.currency || 'USD',
      discountType:
        (initial?.discountType as
          | ProductFormValues['discountType']
          | undefined) ?? 'none',
      discountValue:
        typeof initial?.discountValue === 'number'
          ? initial.discountValue
          : undefined,
      available: initial?.available ?? true,
    },
  });
  useEffect(() => {
    if (user?.brandName) {
      setValue('vendor', user.brandName);
      setVendorOption({ label: user.brandName, value: user.brandName });
    }
  }, [user, setValue]);
  const [images, setImages] = useState<File[]>([]);
  const [vendorOption, setVendorOption] = useState<SelectOption | null>(
    initial?.vendor ? { label: initial.vendor, value: initial.vendor } : null
  );
  const [categoryOption, setCategoryOption] = useState<SelectOption | null>(
    initial?.categoryId
      ? { label: '', value: String(initial.categoryId) }
      : null
  );
  const loadCategoryOptions = async (
    inputValue: string
  ): Promise<SelectOption[]> => {
    const params = new URLSearchParams({ search: inputValue, limit: '20' });
    const res = await fetch(`/api/categories?${params.toString()}`);
    if (!res.ok) return [];
    const data: import('../../types').CategoriesResponse = await res.json();
    return (data.categories || []).map((c) => ({
      label: c.name,
      value: String(c.id),
    }));
  };

  const loadVendorOptions = async (
    inputValue: string
  ): Promise<SelectOption[]> => {
    const params = new URLSearchParams({ search: inputValue, limit: '20' });
    const res = await fetch(`/api/vendors?${params.toString()}`);
    if (!res.ok) return [];
    const data: VendorsResponse = await res.json();
    return (data.vendors || []).map((v) => ({
      label: v.brandName ?? '',
      value: v.brandName ?? '',
    }));
  };

  const openCreateVendor = async (input: string) => {
    const name = input.trim();
    if (requestNewVendor) {
      const v = await requestNewVendor(name);
      if (v) {
        const opt = { label: v.brandName, value: v.brandName } as SelectOption;
        setVendorOption(opt);
        setValue('vendor', opt.value);
        return;
      }
    }
    const opt = { label: name, value: name } as SelectOption;
    setVendorOption(opt);
    setValue('vendor', name);
  };

  const openCreateCategory = async (input: string) => {
    const name = input.trim();
    if (!requestNewCategory) return;
    const cat = await requestNewCategory(name);
    if (cat) {
      const opt = { label: cat.name, value: String(cat.id) } as SelectOption;
      setCategoryOption(opt);
      setValue('categoryId', opt.value);
    }
  };

  const onFormSubmit = handleSubmit(
    async (values) => {
      const fd = new FormData();
      fd.append('id', values.id);
      fd.append('vendor', values.vendor);
      fd.append('sku', values.sku);
      fd.append('title', values.title);
      fd.append('description', values.description);
      fd.append('product_type', values.productType);
      fd.append('tags', values.tags.join(','));
      fd.append('category_id', values.categoryId);
      fd.append('quantity', values.available ? String(values.quantity) : '0');
      fd.append('min_price', String(values.minPrice));
      fd.append('max_price', String(values.maxPrice));
      fd.append('currency', values.currency);
      if (values.discountType !== 'none') {
        fd.append('discount_type', values.discountType);
        if (values.discountValue !== undefined)
          fd.append('discount_value', String(values.discountValue));
      }
      images.forEach((img) => fd.append('photos', img));
      await onSubmit(fd);
    },
    (invalid) => {
      const first = Object.keys(invalid)[0] as
        | keyof ProductFormValues
        | undefined;
      if (first) setFocus(first);
    }
  );

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setImages(files);
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      <input type="hidden" {...register('id')} />
      <TextInput<ProductFormValues>
        label="SKU"
        name="sku"
        register={register}
        rules={{ required: 'Required' }}
        error={errors.sku?.message}
      />
      <div className="mb-4">
        <label
          htmlFor="vendor-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Vendor
        </label>
        <Controller
          name="vendor"
          control={control}
          rules={{ required: 'Required' }}
          render={({ field }) => (
            <AsyncCreatableSelect
              inputId="vendor-select"
              ref={field.ref}
              value={vendorOption}
              defaultOptions
              loadOptions={loadVendorOptions}
              onBlur={field.onBlur}
              onChange={(val) => {
                if (!val) {
                  setVendorOption(null);
                  field.onChange('');
                } else if (!Array.isArray(val)) {
                  setVendorOption(val as SelectOption);
                  field.onChange(val.value);
                }
              }}
              onCreateOption={openCreateVendor}
              formatCreateLabel={() => 'Create New Vendor'}
              isValidNewOption={(input, _value, options) =>
                input.trim().length > 0 && options.length === 0
              }
              placeholder="Vendor"
              classNamePrefix="react-select"
              isDisabled={!!user?.brandName}
            />
          )}
        />
        {errors.vendor && (
          <p className="text-sm text-red-600">{errors.vendor.message}</p>
        )}
      </div>
      <TextInput<ProductFormValues>
        label="Title"
        name="title"
        register={register}
        rules={{ required: 'Required' }}
        error={errors.title?.message}
      />
      <div>
        <Textarea<ProductFormValues>
          label="Description"
          name="description"
          register={register}
          rules={{ required: 'Required' }}
          error={errors.description?.message}
        />
      </div>
      <TextInput<ProductFormValues>
        label="Product Type"
        name="productType"
        register={register}
        rules={{ required: 'Required' }}
        error={errors.productType?.message}
      />
      <div>
        <TagInput<ProductFormValues>
          label="Tags"
          name="tags"
          control={control}
          placeholder="Search or create tags"
          error={errors.tags?.message as string}
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="category-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category
        </label>
        <Controller
          name="categoryId"
          control={control}
          rules={{ required: 'Required' }}
          render={({ field }) => (
            <AsyncCreatableSelect
              inputId="category-select"
              ref={field.ref}
              value={categoryOption}
              defaultOptions
              loadOptions={loadCategoryOptions}
              onBlur={field.onBlur}
              onChange={(val) => {
                if (!val) {
                  setCategoryOption(null);
                  field.onChange('');
                } else if (!Array.isArray(val)) {
                  setCategoryOption(val as SelectOption);
                  field.onChange(val.value);
                }
              }}
              onCreateOption={openCreateCategory}
              formatCreateLabel={() => 'Create New Category'}
              isValidNewOption={(input, _value, options) =>
                input.trim().length > 0 && options.length === 0
              }
              placeholder="Category"
              classNamePrefix="react-select"
            />
          )}
        />
        {errors.categoryId && (
          <p className="text-sm text-red-600">{errors.categoryId.message}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <TextInput<ProductFormValues>
          label="Quantity"
          name="quantity"
          type="number"
          min={0}
          step={1}
          register={register}
          rules={{ min: { value: 0, message: 'Must be >= 0' } }}
          error={errors.quantity?.message}
        />
        <Checkbox<ProductFormValues>
          label="Available"
          name="available"
          checked={watch('available')}
          onChange={(e) => setValue('available', e.target.checked)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <TextInput<ProductFormValues>
          label="Min Price"
          name="minPrice"
          type="number"
          min={0}
          step="0.01"
          register={register}
          rules={{
            required: 'Required',
            min: { value: 0, message: 'Must be >= 0' },
          }}
          error={errors.minPrice?.message}
        />
        <TextInput<ProductFormValues>
          label="Max Price"
          name="maxPrice"
          type="number"
          min={0}
          step="0.01"
          register={register}
          rules={{
            required: 'Required',
            min: { value: 0, message: 'Must be >= 0' },
          }}
          error={errors.maxPrice?.message}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="discountType"
          >
            Discount Type
          </label>
          <select
            id="discountType"
            className="select select-bordered w-full"
            {...register('discountType')}
          >
            <option value="none">None</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>
        {watch('discountType') !== 'none' && (
          <TextInput<ProductFormValues>
            label="Discount Value"
            name="discountValue"
            type="number"
            step="0.01"
            register={register}
            rules={{
              required: 'Required',
              validate: (v) => {
                const num = typeof v === 'number' ? v : Number(v);
                if (watch('discountType') === 'percentage') {
                  if (isNaN(num) || num <= 0 || num >= 100) return '1-99';
                  return true;
                } else {
                  if (isNaN(num) || num >= watch('minPrice'))
                    return 'Must be < price';
                  return true;
                }
              },
            }}
            error={errors.discountValue?.message}
          />
        )}
      </div>
      <TextInput<ProductFormValues>
        label="Currency"
        name="currency"
        register={register}
        rules={{ required: 'Required' }}
        error={errors.currency?.message}
      />
      <div>
        <FileUpload<ProductFormValues>
          label="Images"
          name="title"
          multiple
          accept="image/*"
          onChange={handleImagesChange}
        />
      </div>
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={URL.createObjectURL(img)}
              alt="preview"
              className="w-20 h-20 object-cover rounded"
            />
          ))}
        </div>
      )}
      <div className="flex gap-2 mt-2">
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
    </form>
  );
};

export default ProductForm;
