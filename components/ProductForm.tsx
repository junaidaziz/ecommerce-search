import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';
import type { SelectOption } from './form-fields/SelectDropdown';
import { TextInput, Textarea, FileUpload, Checkbox } from './form-fields';

export interface ProductFormValues {
  sku: string;
  title: string;
  description: string;
  productType: string;
  tags: string;
  category: string;
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
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormValues>({
    defaultValues: {
      sku: initial?.sku || '',
      title: initial?.title || '',
      description: initial?.description || '',
      productType: initial?.productType || '',
      tags: initial?.tags || '',
      category: initial?.category || '',
      quantity: initial?.quantity ?? 0,
      minPrice: initial?.minPrice ?? 0,
      maxPrice: initial?.maxPrice ?? 0,
      currency: initial?.currency || 'USD',
      available: initial?.available ?? true,
    },
  });
  const [images, setImages] = useState<File[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const loadCategories = async () => {
    if (categoryOptions.length > 0) return;
    const res = await fetch('/api/categories');
    if (!res.ok) return;
    const data = await res.json();
    const opts = (data.categories || []).map((c: any) => ({
      label: c.name,
      value: c.name,
    }));
    setCategoryOptions(opts);
  };
  useEffect(() => {
    loadCategories();
  }, []);

  const onFormSubmit = handleSubmit(async (values) => {
    const fd = new FormData();
    fd.append('sku', values.sku);
    fd.append('title', values.title);
    fd.append('description', values.description);
    fd.append('product_type', values.productType);
    fd.append('tags', values.tags);
    fd.append('category', values.category);
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
    <form onSubmit={onFormSubmit} className="space-y-2">
      <TextInput<ProductFormValues>
        label="SKU"
        name="sku"
        register={register}
        rules={{ required: 'Required' }}
        error={errors.sku?.message}
      />
      <TextInput<ProductFormValues>
        label="Title"
        name="title"
        register={register}
        rules={{ required: 'Required' }}
        error={errors.title?.message}
      />
      <Textarea<ProductFormValues>
        label="Description"
        name="description"
        register={register}
        rules={{ required: 'Required' }}
        error={errors.description?.message}
      />
      <TextInput<ProductFormValues>
        label="Product Type"
        name="productType"
        register={register}
        error={errors.productType?.message}
      />
      <TextInput<ProductFormValues>
        label="Tags"
        name="tags"
        register={register}
        error={errors.tags?.message}
      />
      <Controller
        name="category"
        control={control}
        rules={{ required: 'Required' }}
        render={({ field }) => (
          <CreatableSelect
            {...field}
            options={categoryOptions}
            onChange={(val) => {
              if (!val) return field.onChange('');
              if (Array.isArray(val)) return;
              field.onChange(val.value);
            }}
            onCreateOption={async (input) => {
              await fetch('/api/brand/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: input }),
              });
              const opt = { label: input, value: input };
              setCategoryOptions((prev) => [...prev, opt]);
              field.onChange(input);
            }}
            placeholder="Category"
            classNamePrefix="react-select"
          />
        )}
      />
      {errors.category && (
        <p className="text-sm text-red-600">{errors.category.message}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <TextInput<ProductFormValues>
          label="Quantity"
          name="quantity"
          type="number"
          min={0}
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
          rules={{ min: { value: 0, message: 'Must be >= 0' } }}
          error={errors.minPrice?.message}
        />
        <TextInput<ProductFormValues>
          label="Max Price"
          name="maxPrice"
          type="number"
          min={0}
          step="0.01"
          register={register}
          rules={{ min: { value: 0, message: 'Must be >= 0' } }}
          error={errors.maxPrice?.message}
        />
      </div>
      <TextInput<ProductFormValues>
        label="Currency"
        name="currency"
        register={register}
        error={errors.currency?.message}
      />
      <FileUpload<ProductFormValues>
        label="Images"
        name="images"
        multiple
        accept="image/*"
        onChange={handleImagesChange}
      />
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
