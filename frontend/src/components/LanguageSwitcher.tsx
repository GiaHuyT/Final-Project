"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import Cookies from "js-cookie";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Language {
    code: string;
    name: string;
    flag: string;
}

const languages: Language[] = [
    { code: "vi", name: "Tiếng Việt", flag: "vn" },
    { code: "en", name: "English", flag: "us" },
    { code: "ja", name: "日本語", flag: "jp" },
    { code: "ko", name: "한국어", flag: "kr" },
    { code: "zh-CN", name: "中文", flag: "cn" },
    { code: "fr", name: "Français", flag: "fr" },
    { code: "de", name: "Deutsch", flag: "de" },
    { code: "es", name: "Español", flag: "es" },
    { code: "ru", name: "Русский", flag: "ru" },
];

export function LanguageSwitcher() {
    const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        const initLangCode = Cookies.get("googtrans")?.split("/")?.[2] || "vi";
        const found = languages.find(l => l.code === initLangCode);
        if (found) setCurrentLang(found);

        if (!document.getElementById("google-translate-script")) {
            const addScript = document.createElement("script");
            addScript.id = "google-translate-script";
            addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            addScript.async = true;
            
            (window as any).googleTranslateElementInit = () => {
                new (window as any).google.translate.TranslateElement(
                    { pageLanguage: 'vi', autoDisplay: false },
                    'google_translate_element'
                );
            };

            document.body.appendChild(addScript);
        }
    }, []);

    const handleSelectLanguage = (langCode: string) => {
        const selectElement = document.querySelector("#google_translate_element select") as HTMLSelectElement;
        
        if (selectElement) {
            selectElement.value = langCode;
            selectElement.dispatchEvent(new Event("change"));
            
            const selected = languages.find(l => l.code === langCode);
            if (selected) {
                setCurrentLang(selected);
                // The widget saves its own cookie "googtrans" e.g., "/vi/en", but we can manually set it to be sure
                Cookies.set("googtrans", `/vi/${langCode}`);
            }
        } else {
            // Widget might not be fully loaded yet
            Cookies.set("googtrans", `/vi/${langCode}`);
            window.location.reload();
        }
    };

    if (!isMounted) return null;

    return (
        <div className="relative flex items-center">
            <div id="google_translate_element" className="hidden"></div>

            <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center gap-1.5 h-8 outline-none text-slate-600 hover:text-primary transition-colors cursor-pointer rounded-full px-2.5 hover:bg-slate-100 font-semibold text-sm select-none">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline-block font-bold text-[11px] uppercase tracking-wider mt-[1px]">
                        {currentLang.flag.toUpperCase()}
                    </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-[9999]" align="end">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 pb-2 mt-1 mb-1 border-b border-slate-50">
                        Chọn ngôn ngữ
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {languages.map((lang) => (
                            <DropdownMenuItem 
                                key={lang.code}
                                onClick={() => handleSelectLanguage(lang.code)}
                                className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-xl font-body transition-colors ${currentLang.code === lang.code ? 'bg-primary/5 text-primary font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                            >
                                <img src={`https://flagcdn.com/w40/${lang.flag}.png`} alt={lang.name} className="w-6 h-auto rounded-sm object-cover shadow-[0_0_2px_rgba(0,0,0,0.1)] shrink-0" />
                                <span className="text-sm font-medium">{lang.name}</span>
                            </DropdownMenuItem>
                        ))}
                    </div>
                    <div className="mt-2 text-[9px] text-center text-slate-400 font-medium px-2 py-1 bg-slate-50 rounded-lg">
                        Bản dịch tự động bởi Google
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
