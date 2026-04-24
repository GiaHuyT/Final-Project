"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, X, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DestinationsPage() {
    const [destinations, setDestinations] = useState<any[]>([]);

    // Form State
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');

    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    useEffect(() => {
        const savedDest = localStorage.getItem('driver_destinations');
        if (savedDest) {
            try {
                setDestinations(JSON.parse(savedDest));
            } catch (e) { }
        }
        fetchProvinces();
    }, []);

    const fetchProvinces = async () => {
        setLoadingProvinces(true);
        try {
            const res = await fetch('https://provinces.open-api.vn/api/p/');
            const data = await res.json();
            setProvinces(data);
        } catch (error) {
            console.error("Lỗi tải danh sách tỉnh/thành:", error);
        }
        setLoadingProvinces(false);
    };

    const fetchDistricts = async (provinceCode: string) => {
        setLoadingDistricts(true);
        try {
            const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data = await res.json();
            setDistricts(data.districts || []);
        } catch (error) {
            console.error("Lỗi tải danh sách quận/huyện:", error);
        }
        setLoadingDistricts(false);
    };

    const fetchWards = async (districtCode: string) => {
        setLoadingWards(true);
        try {
            const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const data = await res.json();
            setWards(data.wards || []);
        } catch (error) {
            console.error("Lỗi tải danh sách phường/xã:", error);
        }
        setLoadingWards(false);
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        setSelectedProvince(code);
        setSelectedDistrict('');
        setSelectedWard('');
        setWards([]);
        if (code) fetchDistricts(code);
        else setDistricts([]);
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        setSelectedDistrict(code);
        setSelectedWard('');
        if (code) fetchWards(code);
        else setWards([]);
    };

    const handleAddDestination = () => {
        if (!selectedProvince || !selectedDistrict || !selectedWard) {
            alert("Vui lòng chọn đầy đủ Tỉnh, Quận và Phường!");
            return;
        }

        const pName = provinces.find(p => p.code.toString() === selectedProvince)?.name;
        const dName = districts.find(d => d.code.toString() === selectedDistrict)?.name;
        const wName = wards.find(w => w.code.toString() === selectedWard)?.name;

        const fullAddress = `${wName}, ${dName}, ${pName}`;
        
        const newDest = {
            id: Date.now(),
            address: fullAddress,
        };

        const newDestinations = [newDest, ...destinations];
        setDestinations(newDestinations);
        localStorage.setItem('driver_destinations', JSON.stringify(newDestinations));
        
        // Reset form completely
        setSelectedProvince('');
        setSelectedDistrict('');
        setSelectedWard('');
        setDistricts([]);
        setWards([]);
    };

    const handleRemove = (idToRemove: number) => {
        const newDestinations = destinations.filter(d => d.id !== idToRemove);
        setDestinations(newDestinations);
        localStorage.setItem('driver_destinations', JSON.stringify(newDestinations));
    };

    const pName = provinces.find(p => p.code.toString() === selectedProvince)?.name || '';
    const dName = districts.find(d => d.code.toString() === selectedDistrict)?.name || '';
    const wName = wards.find(w => w.code.toString() === selectedWard)?.name || '';
    const mapQuery = [wName, dName, pName].filter(Boolean).join(', ') || 'Việt Nam';
    
    let zoomLevel = 6; // Default cho toàn quốc
    if (selectedWard) zoomLevel = 15; // Phóng to đến Phường/Xã
    else if (selectedDistrict) zoomLevel = 13; // Phóng to đến Quận/Huyện
    else if (selectedProvince) zoomLevel = 10; // Phóng to đến Tỉnh/Thành
    
    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-10">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đăng ký khu vực</h1>
                <p className="text-slate-500 mt-2 text-[15px]">
                    Đăng ký các địa chỉ hoặc khu vực hoạt động của bạn qua API bản đồ Việt Nam.
                </p>
            </div>

            {/* Bản đồ động */}
            <div className="w-full aspect-square max-h-[500px] rounded-[24px] overflow-hidden border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] bg-slate-50 relative">
                {!mapQuery && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                    </div>
                )}
                <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`}
                    className="relative z-10"
                ></iframe>
            </div>

            {/* Form Input Container */}
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Tỉnh / Thành phố */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold text-[13px]">Tỉnh/Thành phố</Label>
                        <div className="relative">
                            <select 
                                className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none disabled:opacity-50"
                                value={selectedProvince}
                                onChange={handleProvinceChange}
                                disabled={loadingProvinces}
                            >
                                <option value="">Chọn Tỉnh/Thành</option>
                                {provinces.map(p => (
                                    <option key={p.code} value={p.code}>{p.name}</option>
                                ))}
                            </select>
                            {loadingProvinces && <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-slate-400" />}
                        </div>
                    </div>

                    {/* Quận / Huyện */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold text-[13px]">Quận/Huyện</Label>
                        <div className="relative">
                            <select 
                                className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none disabled:opacity-50"
                                value={selectedDistrict}
                                onChange={handleDistrictChange}
                                disabled={!selectedProvince || loadingDistricts}
                            >
                                <option value="">Chọn Quận/Huyện</option>
                                {districts.map(d => (
                                    <option key={d.code} value={d.code}>{d.name}</option>
                                ))}
                            </select>
                            {loadingDistricts && <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-slate-400" />}
                        </div>
                    </div>

                    {/* Phường / Xã */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold text-[13px]">Phường/Xã</Label>
                        <div className="relative">
                            <select 
                                className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none disabled:opacity-50"
                                value={selectedWard}
                                onChange={(e) => setSelectedWard(e.target.value)}
                                disabled={!selectedDistrict || loadingWards}
                            >
                                <option value="">Chọn Phường/Xã</option>
                                {wards.map(w => (
                                    <option key={w.code} value={w.code}>{w.name}</option>
                                ))}
                            </select>
                            {loadingWards && <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-slate-400" />}
                        </div>
                    </div>
                </div>

                {/* Nút lưu */}
                <div className="flex justify-end mt-5">
                    <Button 
                        onClick={handleAddDestination}
                        className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm font-bold w-full sm:w-auto"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Lưu khu vực
                    </Button>
                </div>
            </div>

            {/* Selected Destinations List */}
            {destinations.length > 0 && (
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                    <h2 className="text-[16px] font-bold text-slate-800 mb-4">Các địa chỉ đã đăng ký</h2>
                    <div className="space-y-3">
                        {destinations.map((dest) => (
                            <div key={dest.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 bg-emerald-100 p-1.5 rounded-full">
                                        <MapPin className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <span className="text-[15px] text-slate-700 font-medium leading-relaxed">
                                        {dest.address}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => handleRemove(dest.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4 shrink-0"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
