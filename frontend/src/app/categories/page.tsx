"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import http from "@/lib/http";
import {
    Search,
    ChevronDown,
    Filter,
    Car,
    ArrowUpDown,
    X,
    Heart,
    ShoppingBag,
    Loader2,
    SlidersHorizontal,
    Tag,
    History,
    Store,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import WishlistButton from "@/components/ui/wishlist-button";
import CartButton from "@/components/ui/cart-button";

// Custom Dropdown Component
interface FilterDropdownProps {
    label: string;
    icon: React.ReactNode;
    options: { id: string | number, name: string }[];
    selected: string | number;
    onSelect: (value: string | number) => void;
    placeholder: string;
}

const FilterDropdown = ({ label, icon, options, selected, onSelect, placeholder }: FilterDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedName = options.find(opt => opt.id.toString() === selected.toString())?.name || placeholder;

    return (
        <div className="space-y-3" ref={containerRef}>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {icon} {label}
            </label>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all text-sm font-bold",
                        selected !== "" && selected !== undefined
                            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10"
                            : "bg-white text-slate-600 border-slate-100 hover:border-slate-200"
                    )}
                >
                    <span className="truncate">{selectedName}</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 top-full mt-2 w-full bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-60 overflow-y-auto py-2 px-2 custom-scrollbar">
                            <button
                                onClick={() => { onSelect(""); setIsOpen(false); }}
                                className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-colors"
                            >
                                {placeholder}
                            </button>
                            {options.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => { onSelect(opt.id); setIsOpen(false); }}
                                    className={cn(
                                        "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all mb-1 last:mb-0",
                                        selected.toString() === opt.id.toString()
                                            ? "bg-blue-600 text-white"
                                            : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {opt.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function CarModelsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);

    // Filter states
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedVendor, setSelectedVendor] = useState("");
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [sortBy, setSortBy] = useState("newest");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

    const fetchProducts = useCallback(async () => {
        setFilterLoading(true);
        try {
            const params: any = {};
            if (selectedBrand) params.brand = selectedBrand;
            if (selectedModel) params.modelName = selectedModel;
            if (selectedVendor) params.vendorId = selectedVendor;
            if (priceRange.min) params.minPrice = priceRange.min;
            if (priceRange.max) params.maxPrice = priceRange.max;
            if (sortBy) params.sortBy = sortBy;

            const { data } = await http.get('/products', { params });
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Không thể tải danh sách sản phẩm");
        } finally {
            setFilterLoading(false);
        }
    }, [selectedBrand, selectedModel, selectedVendor, priceRange, sortBy]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [brandsRes, vendorsRes] = await Promise.all([
                    http.get('/brands'),
                    http.get('/users/vendors')
                ]);
                setBrands(brandsRes.data);
                setVendors(vendorsRes.data);

                // Fetch favorite IDs if logged in
                const token = localStorage.getItem('token');
                if (token) {
                    const favsRes = await http.get('/favorites/ids');
                    setFavoriteIds(favsRes.data);
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const activeModels = brands.find(b => b.name === selectedBrand)?.models || [];

    const handleClearFilters = () => {
        setSelectedBrand("");
        setSelectedModel("");
        setSelectedVendor("");
        setPriceRange({ min: "", max: "" });
        setSortBy("newest");
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-white">
                <Loader2 className="animate-spin h-16 w-16 text-blue-600 mb-4" />
                <p className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">Đang chuẩn bị gara...</p>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pt-20">
            {/* Header Section */}
            <div className="relative bg-slate-900 overflow-hidden py-16 px-6 lg:px-12">
                <div className="absolute inset-0 opacity-20">
                    <img src="/images/static/hero-bg.jpg" className="w-full h-full object-cover" alt="Background" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>
                </div>
                <div className="relative z-10 max-w-[1400px] mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4 italic uppercase">Các mẫu xe</h1>
                    <p className="text-slate-300 font-medium text-lg max-w-2xl leading-relaxed">
                        Tham quan bộ sưu tập các dòng xe biểu tượng. Từ những mẫu sedan lịch lãm đến các dòng xe thể thao hiệu năng cao.
                    </p>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Filter Sidebar */}
                    <aside className={cn(
                        "lg:w-80 space-y-8 lg:block shrink-0 transition-all duration-300",
                        isSidebarOpen ? "block" : "hidden"
                    )}>
                        <div className="sticky top-28 space-y-10 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-4 pb-8">
                            {/* Brand Dropdown */}
                            <FilterDropdown
                                label="Hãng xe"
                                icon={<Tag className="w-3 h-3" />}
                                options={brands.map(b => ({ id: b.name, name: b.name }))}
                                selected={selectedBrand}
                                onSelect={(val) => { setSelectedBrand(val.toString()); setSelectedModel(""); }}
                                placeholder="Chọn hãng xe"
                            />

                            {/* Model Dropdown (Only shown if Brand is selected) */}
                            {selectedBrand && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <FilterDropdown
                                        label={`Dòng xe ${selectedBrand}`}
                                        icon={<Car className="w-3 h-3" />}
                                        options={activeModels.map((m: any) => ({ id: m.name, name: m.name }))}
                                        selected={selectedModel}
                                        onSelect={(val) => setSelectedModel(val.toString())}
                                        placeholder="Tất cả dòng xe"
                                    />
                                </div>
                            )}

                            {/* Vendor Dropdown */}
                            <FilterDropdown
                                label="Nhà cung cấp"
                                icon={<Store className="w-3 h-3" />}
                                options={vendors.map(v => ({ id: v.id, name: v.username }))}
                                selected={selectedVendor}
                                onSelect={(val) => setSelectedVendor(val.toString())}
                                placeholder="Chọn nhà cung cấp"
                            />

                            {/* Price Filter */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <ShoppingBag className="w-3 h-3" /> Khoảng giá (VND)
                                </label>
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="number"
                                        placeholder="Từ..."
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 focus:ring-0 transition-all font-bold text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Đến..."
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 focus:ring-0 transition-all font-bold text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleClearFilters}
                                className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-dashed border-slate-200"
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="lg:hidden p-3 rounded-2xl bg-slate-100 text-slate-600"
                                >
                                    <SlidersHorizontal className="w-5 h-5" />
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-slate-900">{products.length} xe đang hiển thị</span>
                                    {filterLoading && <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest animate-pulse">Đang cập nhật...</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none bg-slate-50 border-none rounded-2xl px-6 py-3 pr-12 font-bold text-sm text-slate-700 cursor-pointer focus:ring-2 focus:ring-slate-200 transition-all"
                                    >
                                        <option value="newest">Mới nhất</option>
                                        <option value="price_asc">Giá: Thấp đến Cao</option>
                                        <option value="price_desc">Giá: Cao đến Thấp</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                                <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                                    <Search className="w-8 h-8 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Không tìm thấy xe nào</h3>
                                <p className="text-slate-500 font-medium">Thử thay đổi bộ lọc hoặc xóa các tùy chọn đã chọn.</p>
                                <button
                                    onClick={handleClearFilters}
                                    className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                                >
                                    Xóa lọc để quay lại
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 text-left">
                                {products.map((product) => (
                                    <div key={product.id} className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden relative text-left">
                                        <Link href={`/products/${product.id}`} className="block relative h-64 overflow-hidden bg-slate-100">
                                            <img
                                                src={product.imageUrl || "/images/static/car-placeholder.png"}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            />
                                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                                <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 border border-white/50 shadow-sm w-fit">
                                                    {product.brand}
                                                </span>
                                            </div>
                                            <WishlistButton 
                                                productId={product.id} 
                                                initialIsFavorited={favoriteIds.includes(product.id)}
                                                className="absolute top-6 right-6"
                                            />
                                            <CartButton
                                                productId={product.id}
                                                className="absolute top-20 right-6"
                                            />
                                            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                                <div className="bg-black text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
                                                    Xem chi tiết
                                                </div>
                                            </div>
                                        </Link>

                                        <div className="p-8">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{product.modelName}</span>
                                                <span className="text-[10px] font-bold text-slate-400 capitalize">{product.condition}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight leading-tight line-clamp-2 min-h-[3rem]">
                                                {product.name}
                                            </h3>

                                            <div className="flex items-baseline gap-1 mb-6">
                                                <span className="text-3xl font-black text-slate-900">{product.price?.toLocaleString()}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">VND</span>
                                            </div>

                                            <div className="flex flex-col gap-1 mb-6">
                                                <div className="flex items-center gap-2">
                                                    <Store className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cung cấp bởi:</span>
                                                    <Link href={`/vendor/${product.vendorId}`} className="text-[10px] font-black text-slate-900 uppercase underline decoration-blue-500 underline-offset-4 hover:text-blue-600 transition-colors">
                                                        {product.vendor?.username}
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <History className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Năm SX</span>
                                                        <span className="text-xs font-bold text-slate-900">{product.year}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <span className="material-symbols-outlined text-base">speed</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hiệu năng</span>
                                                        <span className="text-xs font-bold text-slate-900">V8 Turbo</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
