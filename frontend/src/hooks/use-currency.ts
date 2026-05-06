import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CurrencyState {
  currency: string;
  setCurrency: (currency: string) => void;
}

export const useCurrency = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'VND',
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'currency-storage',
    }
  )
);
