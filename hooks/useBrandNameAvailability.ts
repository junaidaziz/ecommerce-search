import { useCallback, useEffect, useState } from 'react';
import type {
  UseFormClearErrors,
  UseFormGetValues,
  UseFormSetError,
  UseFormWatch,
  FieldValues,
} from 'react-hook-form';

export default function useBrandNameAvailability<T extends FieldValues & { brandName: string }>(
  watch: UseFormWatch<T>,
  getValues: UseFormGetValues<T>,
  setError: UseFormSetError<T>,
  clearErrors: UseFormClearErrors<T>
) {
  const [checkingBrandName, setCheckingBrandName] = useState(false);
  const brandNameValue = watch('brandName' as any);

  const checkBrandName = useCallback(
    async (value: string) => {
      if (!value) {
        clearErrors('brandName' as any);
        return;
      }
      // Trim and validate brand name
      const trimmedValue = value.trim();
      if (trimmedValue.length < 2) {
        setError('brandName' as any, { 
          type: 'manual', 
          message: 'Brand name must be at least 2 characters' 
        });
        return;
      }
      setCheckingBrandName(true);
      try {
        const res = await fetch(
          `/api/check-brand-name?brandName=${encodeURIComponent(trimmedValue)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setError('brandName' as any, {
              type: 'manual',
              message: 'Brand name already taken',
            });
          } else {
            clearErrors('brandName' as any);
          }
        }
      } catch (_) {
        // ignore network errors
      } finally {
        setCheckingBrandName(false);
      }
    },
    [clearErrors, setError]
  );

  useEffect(() => {
    if (!brandNameValue) return;
    const handler = setTimeout(() => {
      void checkBrandName(brandNameValue as unknown as string);
    }, 500);
    return () => clearTimeout(handler);
  }, [brandNameValue, checkBrandName]);

  const handleBrandNameBlur = async () => {
    const value = getValues('brandName' as any);
    await checkBrandName(value as unknown as string);
  };

  return { checkingBrandName, handleBrandNameBlur };
}
