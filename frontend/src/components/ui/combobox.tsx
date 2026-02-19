"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverPortal,
} from "@radix-ui/react-popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "cmdk";

interface ComboBoxProps {
    options: { label: string; value: string }[];
    value?: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function ComboBox({ options, value, onSelect, placeholder = "Chọn...", disabled }: ComboBoxProps) {
    return (
        <div className="relative w-full">
            <select
                value={value || ""}
                onChange={(e) => {
                    console.log("Native select onChange:", e.target.value);
                    onSelect(e.target.value);
                }}
                disabled={disabled}
                className={cn(
                    "w-full h-11 px-3 bg-white border border-gray-200 rounded-lg text-sm outline-none appearance-none cursor-pointer transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium",
                    value ? "text-gray-900" : "text-gray-400"
                )}
            >
                <option value="" disabled className="text-gray-400BG">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value} className="text-gray-900 bg-white py-2">
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-50">
                <ChevronsUpDown className="h-4 w-4" />
            </div>
        </div>
    );
}
