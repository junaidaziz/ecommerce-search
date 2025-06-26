import React, { useEffect, useState } from 'react';
import { GenericInput, GenericModal } from './ui';
import { slugify } from '../lib/slugify';

interface CreateCategoryModalProps {
  isOpen: boolean;
  initialName?: string;
  onClose: () => void;
  onCreated: (cat: { id: number | string; name: string }) => void;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  initialName = '',
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(slugify(initialName));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(initialName);
    setSlug(slugify(initialName));
    setError('');
    setSaving(false);
  }, [initialName, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrim = name.trim();
    const slugTrim = slug.trim();
    if (!nameTrim) {
      setError('Name required');
      return;
    }
    if (!slugTrim) {
      setError('Slug required');
      return;
    }
    setSaving(true);
    try {
      const checkRes = await fetch(
        `/api/categories/check?name=${encodeURIComponent(nameTrim)}`
      );
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.exists) {
          setError(`Category already exists: ${checkData.category.name}`);
          setSaving(false);
          return;
        }
      }
      const createRes = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameTrim, slug: slugTrim }),
      });
      if (createRes.status === 409) {
        const data = await createRes.json().catch(() => ({}));
        const existingName = data.category?.name || nameTrim;
        setError(`Category already exists: ${existingName}`);
        setSaving(false);
        return;
      }
      if (!createRes.ok) {
        const data = await createRes.json().catch(() => ({ message: 'Error' }));
        setError(data.message || 'Error');
        setSaving(false);
        return;
      }
      const data = await createRes.json();
      const cat = (data.category || data) as {
        id: number | string;
        name: string;
      };
      onCreated(cat);
      setName('');
      setSlug('');
      setSaving(false);
      onClose();
    } catch (err) {
      setError('Error');
      setSaving(false);
    }
  };

  return (
    <GenericModal isOpen={isOpen} onClose={onClose} title="Create Category">
      <form onSubmit={handleSubmit} className="space-y-2">
        <GenericInput
          label="Category Name"
          name="category-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSlug(slugify(e.target.value));
          }}
          required
        />
        <GenericInput
          label="Slug"
          name="category-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </GenericModal>
  );
};

export default CreateCategoryModal;
