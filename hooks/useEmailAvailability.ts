import { useCallback, useEffect, useState } from 'react';
import type {
  UseFormClearErrors,
  UseFormGetValues,
  UseFormSetError,
  UseFormWatch,
} from 'react-hook-form';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function useEmailAvailability(
  watch: UseFormWatch<any>,
  getValues: UseFormGetValues<any>,
  setError: UseFormSetError<any>,
  clearErrors: UseFormClearErrors<any>
) {
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailValue = watch('email');

  const checkEmail = useCallback(
    async (value: string) => {
      if (!value) {
        clearErrors('email');
        return;
      }
      if (!emailRegex.test(value)) {
        setError('email', { type: 'pattern', message: 'Invalid email format' });
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
            setError('email', {
              type: 'manual',
              message: 'Email already registered',
            });
          } else {
            clearErrors('email');
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
    const value = getValues('email');
    await checkEmail(value as unknown as string);
  };

  return { checkingEmail, handleEmailBlur };
}
