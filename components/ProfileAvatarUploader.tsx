import { apiFetch } from '@lib/api';
import { useState, useRef, useEffect, useContext } from 'react';
import { fetchJsonSafe } from '@utils/fetchJson';
import useRequireAuth from '@hooks/useRequireAuth';
import { NotificationContext } from '@contexts/NotificationContext';
import type { User } from '@/types';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

const ProfileAvatarUploader: React.FC = () => {
  const user = useRequireAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { addNotification } = useContext(NotificationContext);
  const [current, setCurrent] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchJsonSafe<User | null>('/api/user/profile', null)
      .then((data) => {
        if (data?.profileImage) setCurrent(data.profileImage);
      });
  }, []);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!allowedTypes.includes(f.type)) {
      addNotification('Only JPG, PNG or WebP images allowed', 'error');
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      addNotification('File must be under 2MB', 'error');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const upload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append('profileImage', file);
    const res = await apiFetch('/api/user/profile-picture', {
      method: 'PATCH',
      body: form,
    });
    if (res.ok) {
      setFile(null);
      setPreview(null);
      const data = await res.json().catch(() => null);
      setCurrent(data?.profileImage || null);
      addNotification('Profile image updated', 'success');
    } else {
      addNotification('Upload failed', 'error');
    }
  };

  const remove = async () => {
    const res = await apiFetch('/api/user/profile-picture', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remove: true }),
    });
    if (res.ok) {
      setCurrent(null);
      setPreview(null);
      addNotification('Profile image removed', 'success');
    } else {
      addNotification('Remove failed', 'error');
    }
  };

  const initials = `${(user.firstName?.[0] || '').toUpperCase()}${(user.lastName?.[0] || '').toUpperCase()}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="avatar-image"
          />
        ) : current ? (
          <img
            src={current}
            alt="avatar"
            className="avatar-image"
          />
        ) : (
          <div className="avatar-placeholder">
            {initials}
          </div>
        )}
        <input
          type="file"
          ref={inputRef}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleChange}
        />
      </div>
      {preview ? (
        <div className="flex gap-2">
          <button onClick={upload} className="btn btn-primary btn-sm">
            Save
          </button>
          <button
            onClick={() => {
              setPreview(null);
              setFile(null);
            }}
            className="btn btn-sm"
          >
            Cancel
          </button>
        </div>
      ) : current ? (
        <button onClick={remove} className="btn btn-sm">
          Remove
        </button>
      ) : null}
    </div>
  );
};

export default ProfileAvatarUploader;
