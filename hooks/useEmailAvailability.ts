import { useCallback, useEffect, useState } from 'react';
import type {
  UseFormClearErrors,
  UseFormGetValues,
  UseFormSetError,
  UseFormWatch,
  FieldValues,
} from 'react-hook-form';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function useEmailAvailability<T extends FieldValues & { email: string }>(
  watch: UseFormWatch<T>,
  getValues: UseFormGetValues<T>,
  setError: UseFormSetError<T>,
  clearErrors: UseFormClearErrors<T>
) {
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailValue = watch('email' as any);

  const checkEmail = useCallback(
    async (value: string) => {
      if (!value) {
        clearErrors('email' as any);
        return;
      }
      if (!emailRegex.test(value)) {
        setError('email' as any, { type: 'pattern', message: 'Invalid email format' });
        return;
      }
      setCheckingEmail(true);
      try {
        const res = await fetch(
          `/api/check-email?email=${encodeURIComponent(value)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setError('email' as any, {
              type: 'manual',
              message: 'Email already registered',
            });
          } else {
            clearErrors('email' as any);
          }
        }
      } catch (_) {
        // ignore network errors
      } finally {
        setCheckingEmail(false);
      }
    },
    [clearErrors, setError]
  );

  useEffect(() => {
    if (!emailValue) return;
    const handler = setTimeout(() => {
      void checkEmail(emailValue as unknown as string);
    }, 500);
    return () => clearTimeout(handler);
  }, [emailValue, checkEmail]);

  const handleEmailBlur = async () => {
    const value = getValues('email' as any);
    await checkEmail(value as unknown as string);
  };

  return { checkingEmail, handleEmailBlur };
}
