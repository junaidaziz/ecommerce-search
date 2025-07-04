import { apiFetch } from '@lib/api';
import React, { useState, useEffect } from 'react';

interface Suggestion {
  description: string;
}

interface Props {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

const AddressAutocomplete: React.FC<Props> = ({
  value,
  onChange,
  className,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!value) return setSuggestions([]);
    const controller = new AbortController();
    apiFetch(`/api/address-autocomplete?input=${encodeURIComponent(value)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setSuggestions(data.predictions || []))
      .catch(() => {});
    return () => controller.abort();
  }, [value]);

  return (
    <div className="relative">
      <input
        type="text"
        className={`input input-bordered w-full ${className || ''}`}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShow(true);
        }}
        onBlur={() => setTimeout(() => setShow(false), 100)}
      />
      {show && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-base-100 border w-full shadow">
          {suggestions.map((s) => (
            <li
              key={s.description}
              className="p-2 cursor-pointer hover:bg-base-200"
              onMouseDown={() => {
                onChange(s.description);
                setShow(false);
              }}
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
