"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Search, MapPin, X, Map } from "lucide-react";
import { ComboBox } from "@/components/ui/combobox";

const MapPicker = dynamic(() => import("./MapPicker"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse flex items-center justify-center">Đang tải bản đồ...</div>
});

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
}

export default function AddressModal({ isOpen, onClose, onSave, initialData }: AddressModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        receiverName: "",
        receiverPhone: "",
        detail: "",
        province: "",
        district: "",
        ward: "",
        latitude: 10.7769,
        longitude: 106.7009,
        isDefault: false,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [mapZoom, setMapZoom] = useState(13);

    // Administrative data states
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Normalize string for fuzzy matching (removes accents and common prefixes)
    const normalizeString = (str: string) => {
        if (!str) return "";
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            // Handle all Vietnamese administrative prefixes and abbreviations
            // Adding \b to ensure we only match whole words/abbreviations
            .replace(/^(thanh pho|tỉnh|thành phố|tinh|quan|huyện|huyen|phường|phuong|xã|xa|đường|duong|tp\.|tp|q\.|h\.|p\.|x\.)\s+/g, "")
            .replace(/\s+/g, " ")
            .trim();
    };

    // Simple normalization for search ranking (don't strip prefixes)
    const simpleNormalize = (str: string) => {
        if (!str) return "";
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    };

    const findOptionByLabel = (options: any[], label: string) => {
        if (!label) return null;
        const normalizedTarget = normalizeString(label);
        if (!normalizedTarget) return null;

        // Exact match first
        const exactMatch = options.find(o => normalizeString(o.label) === normalizedTarget);
        if (exactMatch) return exactMatch;

        // Partial match
        return options.find(o => {
            const optLabel = normalizeString(o.label);
            return optLabel.includes(normalizedTarget) || normalizedTarget.includes(optLabel);
        });
    };

    // Helper to render text (Google Maps style - simplified)
    const renderHighlightedText = (text: string, query: string) => {
        return <span className="truncate font-medium text-gray-900">{text}</span>;
    };

    const findBestMatch = (options: any[], candidates: (string | undefined)[]) => {
        // Filter out empty/duplicate candidates
        const uniqueCands = Array.from(new Set(candidates.filter(Boolean))) as string[];
        for (const cand of uniqueCands) {
            const match = findOptionByLabel(options, cand);
            if (match) return match;
        }
        return null;
    };

    const syncAddressFromNominatim = async (addr: any, displayName: string, lat: number, lon: number) => {
        // Comprehensive candidates for each level from Nominatim's diverse address object
        const pCandidates = [addr.city, addr.state, addr.province, addr.city_district];
        const dCandidates = [addr.suburb, addr.district, addr.county, addr.city_district, addr.town];
        const wCandidates = [addr.quarter, addr.suburb, addr.village, addr.ward, addr.neighbourhood, addr.hamlet];

        const nextFormData = {
            ...formData,
            latitude: lat,
            longitude: lon,
            detail: displayName.split(',')[0],
            province: "",
            district: "",
            ward: ""
        };

        // Sequential matching: Province -> District -> Ward
        const fProvince = findBestMatch(provinces, pCandidates);
        if (fProvince) {
            nextFormData.province = fProvince.label;
            const lDistricts = await fetchDistricts(fProvince.value);

            const fDistrict = findBestMatch(lDistricts, dCandidates);
            if (fDistrict) {
                nextFormData.district = fDistrict.label;
                const lWards = await fetchWards(fDistrict.value);

                const fWard = findBestMatch(lWards, wCandidates);
                if (fWard) {
                    nextFormData.ward = fWard.label;
                }
            }
        } else {
            // If province matching fails, check if the town/city name itself is a province (common in VN)
            const fallbackProvince = findBestMatch(provinces, [addr.town, addr.city, addr.state]);
            if (fallbackProvince) {
                nextFormData.province = fallbackProvince.label;
                await fetchDistricts(fallbackProvince.value);
            }
        }

        setFormData(nextFormData);
    };

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await axios.get("https://provinces.open-api.vn/api/p/");
                setProvinces(res.data.map((p: any) => ({ label: p.name, value: p.code.toString() })));
            } catch (error) {
                console.error("Fetch provinces error:", error);
            }
        };
        fetchProvinces();
    }, []);

    const fetchDistricts = useCallback(async (provinceCode: string) => {
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data = res.data.districts.map((d: any) => ({ label: d.name, value: d.code.toString() }));
            setDistricts(data);
            setWards([]);
            return data;
        } catch (error) {
            console.error("Fetch districts error:", error);
            setDistricts([]);
            setWards([]);
            return [];
        }
    }, []);

    const fetchWards = useCallback(async (districtCode: string) => {
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const data = res.data.wards.map((w: any) => ({ label: w.name, value: w.code.toString() }));
            setWards(data);
            return data;
        } catch (error) {
            console.error("Fetch wards error:", error);
            setWards([]);
            return [];
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    title: "",
                    receiverName: "",
                    receiverPhone: "",
                    detail: "",
                    province: "",
                    district: "",
                    ward: "",
                    latitude: 10.7769,
                    longitude: 106.7009,
                    isDefault: false,
                });
                setDistricts([]);
                setWards([]);
            }
        }
    }, [initialData, isOpen]);

    // Handle fetching administrative data for initial edit
    useEffect(() => {
        const initData = async () => {
            if (isOpen && initialData && provinces.length > 0) {
                const foundProvince = provinces.find(p => p.label === initialData.province);
                if (foundProvince) {
                    const loadedDistricts = await fetchDistricts(foundProvince.value);
                    const foundDistrict = loadedDistricts.find((d: any) => d.label === initialData.district);
                    if (foundDistrict) {
                        await fetchWards(foundDistrict.value);
                    }
                }
            }
        };
        initData();
    }, [isOpen, initialData, provinces, fetchDistricts, fetchWards]);

    const handleProvinceChange = async (provinceCode: string) => {
        const province = provinces.find(p => p.value === provinceCode);
        if (!province) return;

        const name = province.label;
        setFormData(prev => ({ ...prev, province: name, district: "", ward: "" }));
        await fetchDistricts(provinceCode);

        // Sync with map
        try {
            const searchRes = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: { q: name, format: "json", limit: 1 }
            });
            if (searchRes.data[0]) {
                const { lat, lon } = searchRes.data[0];
                setFormData(prev => ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lon) }));
            }
        } catch (error) {
            console.error("Geocoding province error:", error);
        }
    };

    const handleDistrictChange = async (districtCode: string) => {
        const name = districts.find(d => d.value === districtCode)?.label || "";
        setFormData(prev => ({ ...prev, district: name, ward: "" }));
        await fetchWards(districtCode);

        // Sync with map
        try {
            const searchRes = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: { q: `${name}, ${formData.province}`, format: "json", limit: 1 }
            });
            if (searchRes.data[0]) {
                const { lat, lon } = searchRes.data[0];
                setFormData(prev => ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lon) }));
            }
        } catch (error) {
            console.error("Geocoding district error:", error);
        }
    };

    const handleWardChange = async (wardCode: string) => {
        const name = wards.find(w => w.value === wardCode)?.label || "";
        setFormData(prev => ({ ...prev, ward: name }));

        // Sync with map
        try {
            const searchRes = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: { q: `${name}, ${formData.district}, ${formData.province}`, format: "json", limit: 1 }
            });
            if (searchRes.data[0]) {
                const { lat, lon } = searchRes.data[0];
                setFormData(prev => ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lon) }));
            }
        } catch (error) {
            console.error("Geocoding ward error:", error);
        }
    };

    // Auto-fetch suggestions when typing
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                    params: {
                        q: searchQuery,
                        format: "json",
                        limit: 10,
                        addressdetails: 1,
                        countrycodes: "vn"
                    },
                    headers: { "Accept-Language": "vi" }
                });

                // Ranking logic: Importance + Administrative prioritization + Province Boost
                const sorted = res.data.sort((a: any, b: any) => {
                    const normQ = simpleNormalize(searchQuery);
                    const nameA = a.display_name.split(',')[0];
                    const nameB = b.display_name.split(',')[0];
                    const normA = simpleNormalize(nameA);
                    const normB = simpleNormalize(nameB);

                    const isAPrefix = normA.startsWith(normQ);
                    const isBPrefix = normB.startsWith(normQ);

                    const isAOfficial = provinces.some(p => normalizeString(p.label) === normalizeString(nameA));
                    const isBOfficial = provinces.some(p => normalizeString(p.label) === normalizeString(nameB));

                    const isAAdmin = ["city", "state", "province", "administrative"].includes(a.addresstype);
                    const isBAdmin = ["city", "state", "province", "administrative"].includes(b.addresstype);

                    // Multiplier-based score
                    const getScore = (isPrefix: boolean, isOfficial: boolean, isAdmin: boolean, importance: string) => {
                        let s = parseFloat(importance || "0.05"); // Lower base to avoid noise
                        if (isPrefix) s *= 10; // HUGE boost for prefix match (matches Google's "Top result" logic)
                        if (isOfficial) s *= 5;
                        if (isAdmin) s *= 20; // Extra boost for administrative results
                        return s;
                    };

                    const scoreA = getScore(isAPrefix, isAOfficial, isAAdmin, a.importance);
                    const scoreB = getScore(isBPrefix, isBOfficial, isBAdmin, b.importance);

                    // console.log(`[${nameA}] P:${isAPrefix} O:${isAOfficial} A:${isAAdmin} S:${scoreA.toFixed(2)}`);

                    return scoreB - scoreA;
                });

                setSuggestions(sorted);
            } catch (error) {
                console.error("Fetch suggestions error:", error);
            }
        };

        const timer = setTimeout(fetchSuggestions, 350);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = async (queryOverride?: string) => {
        const q = queryOverride || searchQuery;
        if (!q.trim()) return;

        setIsSearching(true);
        setShowSuggestions(false);
        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: {
                    q,
                    format: "json",
                    limit: 1,
                    addressdetails: 1,
                },
                headers: { "Accept-Language": "vi" }
            });

            if (res.data && res.data[0]) {
                const result = res.data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);

                await syncAddressFromNominatim(
                    result.address,
                    result.display_name,
                    lat,
                    lon
                );

                // Zoom logic: Administrative areas (Province/City) zoom out, precise points zoom in
                const isCity = ["city", "state", "province", "administrative"].includes(result.addresstype);
                setMapZoom(isCity ? 12 : 18);
            } else {
                toast.error("Không tìm thấy địa chỉ");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            toast.error("Lỗi khi tìm kiếm địa chỉ");
        } finally {
            setIsSearching(false);
        }
    };

    const handleMapChange = async (lat: number, lng: number) => {
        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
                params: {
                    lat,
                    lon: lng,
                    format: "json",
                    addressdetails: 1,
                },
                headers: { "Accept-Language": "vi" }
            });

            if (res.data && res.data.address) {
                await syncAddressFromNominatim(
                    res.data.address,
                    res.data.display_name,
                    lat,
                    lng
                );
            } else {
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {initialData ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[85vh] overflow-y-auto">
                    {/* Left Column: Form Details */}
                    <div className="lg:col-span-5 space-y-5">
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                                Thông tin liên hệ
                            </h3>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="receiverName">Tên người nhận</Label>
                                    <Input id="receiverName" value={formData.receiverName} onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })} placeholder="Họ và tên" className="h-11 bg-gray-50/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="receiverPhone">Số điện thoại</Label>
                                    <Input id="receiverPhone" value={formData.receiverPhone} onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })} placeholder="Số điện thoại nhận hàng" className="h-11 bg-gray-50/30" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 pt-2">
                            <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                                Địa chỉ hành chính
                            </h3>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label>Tỉnh / Thành phố</Label>
                                    <ComboBox
                                        options={provinces}
                                        value={provinces.find(p => p.label === formData.province)?.value}
                                        onSelect={handleProvinceChange}
                                        placeholder="Chọn Tỉnh / Thành phố"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>Quận / Huyện</Label>
                                        <ComboBox
                                            options={districts}
                                            value={districts.find(d => d.label === formData.district)?.value}
                                            onSelect={handleDistrictChange}
                                            placeholder="Chọn Quận / Huyện"
                                            disabled={!formData.province}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phường / Xã</Label>
                                        <ComboBox
                                            options={wards}
                                            value={wards.find(w => w.label === formData.ward)?.value}
                                            onSelect={handleWardChange}
                                            placeholder="Chọn Phường / Xã"
                                            disabled={!formData.district}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="detail">Địa chỉ chi tiết</Label>
                                    <Input id="detail" value={formData.detail} onChange={(e) => setFormData({ ...formData, detail: e.target.value })} placeholder="Số nhà, tên đường..." className="h-11 bg-gray-50/30" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 pt-2">
                            <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                                Thông tin bổ sung
                            </h3>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Tên gợi nhớ (Ví dụ: Nhà riêng, Công ty)</Label>
                                    <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Nhập tên gợi nhớ" className="h-11 bg-gray-50/30" />
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                    />
                                    <Label htmlFor="isDefault" className="cursor-pointer font-semibold text-gray-700">Đặt làm địa chỉ mặc định</Label>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Search & Map */}
                    <div className="lg:col-span-7 space-y-4 bg-gray-50/50 p-1 rounded-2xl border border-gray-100 flex flex-col h-full">
                        <div className="p-4 space-y-4 flex flex-col h-full">
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <Label className="text-gray-600 font-bold">Xác nhận vị trí trên bản đồ</Label>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            className="pl-10 h-11 shadow-sm border-gray-200"
                                            placeholder="Gõ tên đường, phường... để tìm nhanh"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setShowSuggestions(true);
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-[1000] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 divide-y divide-gray-50">
                                                {suggestions.map((s, idx) => {
                                                    const parts = s.display_name.split(',');
                                                    const mainTitle = parts[0];
                                                    const subTitle = parts.slice(1).join(',').trim();
                                                    const isCity = ["city", "state", "province"].includes(s.addresstype);

                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            className="w-full text-left px-4 py-3.5 hover:bg-orange-50 transition-colors flex items-start gap-4"
                                                            onClick={() => {
                                                                setSearchQuery(s.display_name);
                                                                handleSearch(s.display_name);
                                                                const isCity = ["city", "state", "province", "administrative"].includes(s.addresstype);
                                                                setMapZoom(isCity ? 12 : 18);
                                                            }}
                                                        >
                                                            <div className={`mt-0.5 p-2 rounded-full ${isCity ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                                                {isCity ? <Map className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                                            </div>
                                                            <div className="overflow-hidden space-y-0.5">
                                                                <div className="text-sm">
                                                                    {renderHighlightedText(mainTitle, searchQuery)}
                                                                </div>
                                                                {subTitle && (
                                                                    <p className="text-[11px] text-gray-400 truncate leading-tight">
                                                                        {subTitle}
                                                                    </p>
                                                                )}
                                                                {isCity && <span className="inline-block px-1.5 py-0.5 rounded bg-orange-50 text-[9px] font-bold text-orange-500 uppercase">Hành chính</span>}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <Button onClick={() => handleSearch()} disabled={isSearching} className="bg-orange-600 hover:bg-orange-700 text-white h-11 px-6 shadow-md">
                                        {isSearching ? "Đang tìm..." : "Tìm kiếm"}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 rounded-xl overflow-hidden border-2 border-white shadow-xl min-h-[450px]">
                                <MapPicker
                                    lat={formData.latitude}
                                    lng={formData.longitude}
                                    zoom={mapZoom}
                                    onChange={handleMapChange}
                                />
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3 mt-auto">
                                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-blue-700">Mẹo chọn vị trí chính xác:</p>
                                    <p className="text-[11px] text-blue-600 leading-relaxed">Bạn có thể chọn Phường/Xã trước, sau đó kéo ghim đỏ trên bản đồ để chỉ định chính xác số nhà của mình.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50/80 flex justify-end gap-3 backdrop-blur-sm">
                    <Button variant="outline" onClick={onClose} className="border-gray-200 h-12 px-8 font-medium">Huỷ bỏ</Button>
                    <Button onClick={() => onSave(formData)} className="bg-orange-600 hover:bg-orange-700 text-white min-w-[200px] h-12 shadow-lg shadow-orange-200 font-bold text-lg transition-all hover:scale-[1.02] active:scale-95">
                        {initialData ? "CẬP NHẬT ĐỊA CHỈ" : "LƯU ĐỊA CHỈ MỚI"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
