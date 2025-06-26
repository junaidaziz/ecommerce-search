import React, { useState, useContext, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import AsyncCreatableSelect from 'react-select/async-creatable';
import type { SelectOption } from './form-fields/SelectDropdown';
import {
  TextInput,
  Textarea,
  FileUpload,
  Checkbox,
  TagInput,
} from './form-fields';
import { GenericInput, GenericModal } from './ui';
import { slugify } from '../lib/slugify';
import { AppContext } from '../contexts/AppContext';

export interface ProductFormValues {
  id: string;
  vendor: string;
  sku: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  categoryId: string;
  quantity: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  available: boolean;
}

interface ProductFormProps {
  initial?: Partial<ProductFormValues>;
  onSubmit: (data: FormData) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
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
      tags: initial?.tags
        ? initial.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      categoryId: initial?.categoryId ? String(initial.categoryId) : '',
      quantity: initial?.quantity ?? 0,
      minPrice: initial?.minPrice ?? 0,
      maxPrice: initial?.maxPrice ?? 0,
      currency: initial?.currency || 'USD',
      available: initial?.available ?? true,
    },
  });
  useEffect(() => {
    if (user?.brandName) {
      setValue('vendor', user.brandName);
    }
  }, [user, setValue]);
  const [images, setImages] = useState<File[]>([]);
  const [categoryOption, setCategoryOption] = useState<SelectOption | null>(
    initial?.categoryId
      ? { label: '', value: String(initial.categoryId) }
      : null
  );
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [catError, setCatError] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);
  const loadCategoryOptions = async (
    inputValue: string
  ): Promise<SelectOption[]> => {
    const params = new URLSearchParams({ search: inputValue, limit: '20' });
    const res = await fetch(`/api/categories?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.categories || []).map((c: any) => ({
      label: c.name,
      value: String(c.id),
    }));
  };

  const openCreateCategory = (input: string) => {
    const name = input.trim();
    setNewCatName(name);
    setNewCatSlug(slugify(name));
    setCatError('');
    setCreatingCat(false);
    setShowCatModal(true);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setCatError('Name required');
      return;
    }
    setCreatingCat(true);
    const res = await fetch('/api/categories/check-or-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newCatName.trim(),
        slug: newCatSlug.trim(),
      }),
    });
    setCreatingCat(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ message: 'Error' }));
      setCatError(data.message || 'Error');
      return;
    }
    const data = await res.json();
    if (data.exists) {
      setCatError(`Category "${data.name}" already exists`);
      return;
    }
    if (data.success && data.category) {
      const cat = data.category as { id: number | string; name: string };
      const opt = { label: cat.name, value: String(cat.id) } as SelectOption;
      setCategoryOption(opt);
      setValue('categoryId', opt.value);
      setShowCatModal(false);
    }
  };

  const onFormSubmit = handleSubmit(async (values) => {
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
    images.forEach((img) => fd.append('photos', img));
    await onSubmit(fd);
  });

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
      <TextInput<ProductFormValues>
        label="Vendor"
        name="vendor"
        register={register}
        rules={{ required: 'Required' }}
        disabled={!!user?.brandName}
        error={errors.vendor?.message}
      />
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
      <div>
        <Controller
          name="categoryId"
          control={control}
          rules={{ required: 'Required' }}
          render={({ field }) => (
            <>
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
              <GenericModal
                isOpen={showCatModal}
                onClose={() => setShowCatModal(false)}
                title="Create Category"
              >
                <form onSubmit={handleCreateCategory} className="space-y-2">
                  <GenericInput
                    label="Category Name"
                    name="category-name"
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      setNewCatSlug(slugify(e.target.value));
                    }}
                    required
                  />
                  <GenericInput
                    label="Slug"
                    name="category-slug"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    required
                  />
                  {catError && (
                    <p className="text-sm text-red-600">{catError}</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setShowCatModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={creatingCat}
                    >
                      {creatingCat ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </GenericModal>
            </>
          )}
        />
      </div>
      {errors.categoryId && (
        <p className="text-sm text-red-600">{errors.categoryId.message}</p>
      )}
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
          name="images"
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
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
