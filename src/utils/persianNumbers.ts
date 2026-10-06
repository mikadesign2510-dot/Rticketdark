/**
 * Persian number and currency formatting utilities
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return '';
  return String(input).replace(/[0-9]/g, (char) => PERSIAN_DIGITS[parseInt(char, 10)] ?? char);
}

export function formatPersianNumberWithCommas(num: number | string): string {
  if (num === undefined || num === null) return '';
  const numStr = String(num);
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '،');
  return toPersianDigits(parts.join('٫'));
}

export function formatPrice(amount: number): string {
  // Amount in thousands of Tomans (e.g., 85 -> ۸۵,۰۰۰ تومان)
  const tomanValue = amount * 1000;
  return `${formatPersianNumberWithCommas(tomanValue)} تومان`;
}

export function formatSimplePrice(amount: number): string {
  return `${toPersianDigits(amount * 10)} هزار تومان`;
}
