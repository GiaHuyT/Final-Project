import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const EXCHANGE_RATES: Record<string, number> = {
  VND: 1,
  USD: 25450,
  INR: 305,
  JPY: 162,
  CNY: 3500,
  KRW: 18.5,
};

export function formatPrice(vndAmount: number, targetCurrency: string = 'VND') {
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  const converted = vndAmount / rate;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: targetCurrency,
    minimumFractionDigits: targetCurrency === 'VND' || targetCurrency === 'JPY' || targetCurrency === 'KRW' ? 0 : 2,
    maximumFractionDigits: targetCurrency === 'VND' || targetCurrency === 'JPY' || targetCurrency === 'KRW' ? 0 : 2
  }).format(converted);
}
