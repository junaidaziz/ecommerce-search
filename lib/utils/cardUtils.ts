export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

export function detectCardBrand(value: string): CardBrand {
  const digits = value.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^(6011|65|64[4-9])/.test(digits)) return 'discover';
  return 'unknown';
}

export function luhnCheck(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return digits.length > 0 && sum % 10 === 0;
}

export function getCardMaxLength(brand: CardBrand): number {
  switch (brand) {
    case 'amex':
      return 15;
    case 'mastercard':
      return 16;
    case 'visa':
    case 'discover':
      return 19;
    default:
      return 19;
  }
}

export function isValidCardLength(value: string, brand: CardBrand): boolean {
  const len = value.replace(/\D/g, '').length;
  const max = getCardMaxLength(brand);
  if (brand === 'visa' || brand === 'discover') return len >= 16 && len <= max;
  return len === max;
}

export function isExpiryValid(month: string, year: string): boolean {
  const mm = parseInt(month, 10);
  const yyyy = parseInt(year, 10);
  if (isNaN(mm) || isNaN(yyyy) || mm < 1 || mm > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (yyyy < currentYear) return false;
  if (yyyy === currentYear && mm < currentMonth) return false;
  return true;
}
