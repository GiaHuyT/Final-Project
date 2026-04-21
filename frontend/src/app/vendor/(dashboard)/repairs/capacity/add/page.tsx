"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import http from '@/lib/http';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Wrench, FileText, Briefcase, Car, Award } from 'lucide-react';
import Link from 'next/link';

const SPECIALTIES = [
    "Động cơ", "Hệ thống điện", "Phục hồi sau tai nạn", 
    "Khung gầm", "Đồng sơn", "Hộp số", "Bảo dưỡng định kỳ"
];

const VEHICLE_TYPES = [
    "Xe con cỡ nhỏ", "Xe SUV / Gầm cao", "Xe bán tải",
    "Xe tải nhẹ", "Xe tải nặng", "Công nông", "Máy công trình"
];

export default function AddRepairCapacityPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        experienceYears: '',
        brands: '',
        description: '',
        status: 'Hoạt động',
        imageUrl: '',
    });

    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn tệp hình ảnh hợp lệ.');
            return;
        }

        const data = new FormData();
        data.append('file', file);
        setIsUploading(true);
        try {
            const res = await http.post('/users/avatar', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, imageUrl: res.data.avatarUrl }));
            toast.success('Tải ảnh đại diện năng lực thành công!');
        } catch (error) { 
            toast.error('Có lỗi xảy ra khi tải ảnh lên.'); 
        } finally { 
            setIsUploading(false); 
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name) {
            toast.error('Vui lòng nhập tên năng lực.');
            return;
        }

        setIsLoading(true);
        try {
            await http.post('/repairs/capacity', {
                name: formData.name,
                experienceYears: parseInt(formData.experienceYears) || 0,
                brands: formData.brands,
                description: formData.description,
                status: formData.status,
                imageUrl: formData.imageUrl,
                specialty: selectedSpecialties.join(', '),
                vehicleTypes: selectedVehicleTypes.join(', '),
            });
            toast.success('Thêm năng lực sửa chữa thành công!');
            router.push('/vendor/repairs');
        } catch (error: any) { 
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu năng lực.'); 
        } finally { 
            setIsLoading(false); 
        }
    };

    const toggleSpecialty = (sp: string) => {
        setSelectedSpecialties(prev => 
            prev.includes(sp) ? prev.filter(x => x !== sp) : [...prev, sp]
        );
    };

    const toggleVehicleType = (vt: string) => {
        setSelectedVehicleTypes(prev => 
            prev.includes(vt) ? prev.filter(x => x !== vt) : [...prev, vt]
        );
    };

    return (
        <div className="container mx-auto py-6 max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-gray-100 h-12 w-12 text-gray-500">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Thêm Năng Lực Sửa Chữa</h1>
                    <p className="text-muted-foreground font-medium">Hồ sơ năng lực giúp thu hút khách hàng mục tiêu hiệu quả hơn.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Information Card */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Wrench className="w-48 h-48" />
                    </div>
                    
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Thông Tin Chung</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-bold text-gray-700">Tên/Tiêu đề năng lực <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="name" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    className="rounded-xl h-12 bg-gray-50/50 text-base" 
                                    placeholder="VD: Cứu hộ và sửa chữa động cơ Diesel chuyên nghiệp" 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="experienceYears" className="text-sm font-bold text-gray-700">Số năm kinh nghiệm</Label>
                                    <Input 
                                        id="experienceYears" 
                                        name="experienceYears" 
                                        type="number"
                                        min="0"
                                        value={formData.experienceYears} 
                                        onChange={handleChange} 
                                        className="rounded-xl h-12 bg-gray-50/50 text-base" 
                                        placeholder="VD: 5" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-sm font-bold text-gray-700">Trạng thái hồ sơ</Label>
                                    <select 
                                        id="status" 
                                        name="status" 
                                        value={formData.status} 
                                        onChange={handleChange} 
                                        className="flex h-12 w-full rounded-xl border border-input bg-gray-50/50 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium text-gray-700"
                                    >
                                        <option value="Hoạt động">Công khai (Khách hàng có thể thấy)</option>
                                        <option value="Tạm ngưng">Bản nháp / Ẩn</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="brands" className="text-sm font-bold text-gray-700">Các hãng xe chuyên trị</Label>
                                <Input 
                                    id="brands" 
                                    name="brands" 
                                    value={formData.brands} 
                                    onChange={handleChange} 
                                    className="rounded-xl h-12 bg-gray-50/50 text-base" 
                                    placeholder="VD: Honda, Toyota, Mitsubishi (Ngăn cách bởi dấu phẩy)" 
                                />
                            </div>
                        </div>

                        {/* Image Upload Area */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-gray-700">Ảnh đại diện năng lực</Label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="relative h-64 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-50 hover:border-orange-300 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group"
                            >
                                {formData.imageUrl ? (
                                    <>
                                        <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Năng lực sửa chữa" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">Thay đổi ảnh</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-6 space-y-3 text-gray-400 group-hover:text-orange-500 transition-colors">
                                        {isUploading ? (
                                            <Loader2 className="w-10 h-10 animate-spin mx-auto text-orange-500" />
                                        ) : (
                                            <>
                                                <ImageIcon className="w-10 h-10 mx-auto" />
                                                <p className="text-sm font-medium">Bấm vào đây để tải lên hình ảnh minh họa cho năng lực của bạn.</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>
                    </div>
                </div>

                {/* Specialties and Capabilities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                <Award className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Lĩnh Vực Chuyên Môn</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 mt-4">
                            {SPECIALTIES.map(sp => (
                                <label key={sp} className="flex items-center space-x-3 cursor-pointer group p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                                    <input 
                                        type="checkbox"
                                        checked={selectedSpecialties.includes(sp)}
                                        onChange={() => toggleSpecialty(sp)}
                                        className="rounded-md w-5 h-5 border-gray-300 accent-emerald-600 cursor-pointer" 
                                    />
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-700">{sp}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <Car className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Dòng Xe Tiếp Nhận</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 mt-4">
                            {VEHICLE_TYPES.map(vt => (
                                <label key={vt} className="flex items-center space-x-3 cursor-pointer group p-2 hover:bg-blue-50 rounded-lg transition-colors">
                                    <input 
                                        type="checkbox"
                                        checked={selectedVehicleTypes.includes(vt)}
                                        onChange={() => toggleVehicleType(vt)}
                                        className="rounded-md w-5 h-5 border-gray-300 accent-blue-600 cursor-pointer" 
                                    />
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">{vt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detailed Description */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Mô Tả Chi Tiết</h2>
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="description" className="text-sm font-bold text-gray-700">Mô tả thêm về các tiêu chuẩn, trang thiết bị tại xưởng sửa chữa của bạn</Label>
                        <textarea 
                            id="description" 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            className="flex min-h-[200px] w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-base outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium text-gray-700 resize-none" 
                            placeholder="Ví dụ: Xưởng trang bị máy chuẩn đoán lỗi ô tô thế hệ mới nhất, phòng sơn sấy chuẩn Italia..." 
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-4 pb-12">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => router.back()} 
                        className="h-14 px-8 rounded-xl font-bold text-gray-500 hover:bg-gray-100"
                    >
                        Hủy Bỏ
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isLoading || isUploading} 
                        className="h-14 px-10 rounded-xl font-black bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-200 text-white gap-2 transition-all active:scale-95 text-lg"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        Lưu Thay Đổi
                    </Button>
                </div>
            </form>
        </div>
    );
}
