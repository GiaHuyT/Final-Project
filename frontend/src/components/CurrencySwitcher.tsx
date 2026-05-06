"use client";

import { useEffect, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/hooks/use-currency";

const currencies = ["VND", "USD", "INR", "JPY", "CNY", "KRW"];

export function CurrencySwitcher() {
    const { currency, setCurrency } = useCurrency();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center gap-1.5 h-8 outline-none text-slate-600 hover:text-primary transition-colors cursor-pointer rounded-full px-3 hover:bg-slate-100 font-semibold text-sm select-none border border-slate-200">
                <span className="font-bold text-[13px]">
                    {currency}
                </span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-24 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-[9999]" align="end">
                {currencies.map((code) => (
                    <DropdownMenuItem 
                        key={code}
                        onClick={() => setCurrency(code)}
                        className={`flex items-center justify-center cursor-pointer p-2 rounded-xl font-body transition-colors ${currency === code ? 'bg-[#f8f3eb] text-[#6c4826] font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                        <span className="text-sm">{code}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
