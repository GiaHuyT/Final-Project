"use client";

import React, { useState, useRef, useEffect } from 'react';

import http from '@/lib/http';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Wrench, FileText, Briefcase, Car, Award, MapPin } from 'lucide-react';
import Link from 'next/link';

const SPECIALTIES = [
    "Động cơ", "Hệ thống điện", "Phục hồi sau tai nạn",
    "Khung gầm", "Đồng sơn", "Hộp số", "Bảo dưỡng định kỳ"
];

const VEHICLE_TYPES = [
    "Xe con cỡ nhỏ", "Xe SUV / Gầm cao", "Xe bán tải",
    "Xe tải nhẹ", "Xe tải nặng", "Công nông", "Máy công trình"
];

import { useParams, useRouter } from 'next/navigation';

export default function AdminEditRepairCapacityPage() {
    const params = useParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        experienceYears: '',
        province: '',
        district: '',
        contactPhone: '',
        contactName: '',
        description: '',
        status: 'Hoạt động',
        imageUrl: '',
        imageUrls: [] as string[],
    });

    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
    const [provincesList, setProvincesList] = useState<any[]>([]);
    const [districtsList, setDistrictsList] = useState<any[]>([]);

    useEffect(() => {
        let isMounted = true;
        const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;

        const initData = async () => {
            let loadedProvinces: any[] = [];
            try {
                const response = await fetch('https://provinces.open-api.vn/api/?depth=2');
                loadedProvinces = await response.json();
                if (isMounted) setProvincesList(loadedProvinces);
            } catch (err) {
                console.error("Failed to load provinces", err);
            }

            if (!idParam) return;

            const populateForm = (data: any) => {
                if (!isMounted) return;
                setFormData({
                    name: data.name || '',
                    experienceYears: data.experienceYears?.toString() || '',
                    province: data.province || '',
                    district: data.district || '',
                    contactPhone: data.contactPhone || '',
                    contactName: data.contactName || '',
                    description: data.description || '',
                    status: data.status || 'Hoạt động',
                    imageUrl: data.imageUrl || '',
                    imageUrls: data.imageUrls || (data.imageUrl ? [data.imageUrl] : []),
                });
                
                if (data.specialty) {
                    setSelectedSpecialties(data.specialty.split(',').map((s: string) => s.trim()));
                }
                if (data.vehicleTypes) {
                    setSelectedVehicleTypes(data.vehicleTypes.split(',').map((s: string) => s.trim()));
                }

                if (data.province && loadedProvinces.length > 0) {
                    const provinceObj = loadedProvinces.find((p: any) => p.name === data.province);
                    if (provinceObj && provinceObj.districts) {
                        setDistrictsList(provinceObj.districts);
                    }
                }
            };

            const loadMockup = (idStr: string) => {
                const id = parseInt(idStr);
                const mockups: any = {
                    1: {
                        name: "Cứu hộ 24/7 Khu vực Hà Nội",
                        specialty: "Kích bình, Vá lốp, Cẩu kéo xe",
                        experienceYears: 5,
                        vehicleTypes: "Ô tô, Xe tải nhỏ",
                        brands: "Toyota, Kia, Mazda, Honda",
                        status: "Hoạt động",
                        province: "Thành phố Hà Nội",
                        district: "Quận Cầu Giấy",
                        contactPhone: "0988123456",
                        contactName: "Nguyễn Văn A"
                    },
                    2: {
                        name: "Sửa chữa xe máy tận nơi HCM",
                        specialty: "Hệ thống điện",
                        experienceYears: 8,
                        vehicleTypes: "Xe tải nhẹ",
                        status: "Hoạt động",
                        province: "Thành phố Hồ Chí Minh",
                        district: "Quận 1",
                        contactPhone: "0909123456",
                        contactName: "Trần Văn B"
                    },
                    3: {
                        name: "Chuyên gia hộp số tự động",
                        specialty: "Hộp số",
                        experienceYears: 12,
                        vehicleTypes: "Xe SUV / Gầm cao",
                        status: "Hoạt động",
                        province: "Thành phố Đà Nẵng",
                        district: "Quận Hải Châu",
                        contactPhone: "0912123456",
                        contactName: "Lê Văn C"
                    },
                    4: {
                        name: "Phục hồi xe tai nạn",
                        specialty: "Đồng sơn",
                        experienceYears: 15,
                        vehicleTypes: "Xe tải nặng",
                        status: "Hoạt động",
                        province: "Thành phố Hải Phòng",
                        district: "Quận Lê Chân",
                        contactPhone: "0933123456",
                        contactName: "Phạm Văn D"
                    },
                    5: {
                        name: "Cứu hộ xe tải nặng Quốc lộ 1A",
                        specialty: "Bảo dưỡng định kỳ",
                        experienceYears: 10,
                        vehicleTypes: "Xe bán tải",
                        status: "Hoạt động",
                        province: "Tỉnh Đồng Nai",
                        district: "Thành phố Biên Hòa",
                        contactPhone: "0944123456",
                        contactName: "Hoàng Văn E"
                    }
                };
                
                if (mockups[id]) {
                    toast.success("Đang sử dụng dữ liệu mẫu (Mockup)");
                    populateForm(mockups[id]);
                } else {
                    toast.error("Không tìm thấy dữ liệu.");
                }
            };

            try {
                const { data } = await http.get(`/repairs/capacity/public/${idParam}`);
                if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                    populateForm(data);
                } else {
                    loadMockup(idParam);
                }
            } catch (error) {
                console.error("Failed to load repair capacity", error);
                loadMockup(idParam);
            }
        };

        initData();

        return () => {
            isMounted = false;
        };
    }, [params]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceName = e.target.value;
        setFormData(prev => ({ ...prev, province: provinceName, district: '' }));

        const provinceObj = provincesList.find(p => p.name === provinceName);
        if (provinceObj && provinceObj.districts) {
            setDistrictsList(provinceObj.districts);
        } else {
            setDistrictsList([]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        if (formData.imageUrls.length + files.length > 5) {
            toast.error('Chỉ được tải lên tối đa 5 ảnh đại diện năng lực.');
            return;
        }

        setIsUploading(true);
        try {
            const newImageUrls = [...formData.imageUrls];
            for (const file of files) {
                if (!file.type.startsWith('image/')) continue;
                const data = new FormData();
                data.append('file', file);
                const res = await http.post('/users/avatar', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                newImageUrls.push(res.data.avatarUrl);
            }
            setFormData(prev => ({
                ...prev,
                imageUrls: newImageUrls,
                imageUrl: newImageUrls.length > 0 ? newImageUrls[0] : ''
            }));
            toast.success('Tải ảnh thành công!');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tải ảnh lên.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        const newImageUrls = [...formData.imageUrls];
        newImageUrls.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            imageUrls: newImageUrls,
            imageUrl: newImageUrls.length > 0 ? newImageUrls[0] : ''
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Vui lòng nhập tên năng lực.');
            return;
        }

        const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;
        setIsLoading(true);
        try {
            await http.patch(`/repairs/capacity/${idParam}`, {
                name: formData.name,
                experienceYears: parseInt(formData.experienceYears) || 0,
                province: formData.province,
                district: formData.district,
                contactPhone: formData.contactPhone,
                contactName: formData.contactName,
                description: formData.description,
                status: formData.status,
                imageUrl: formData.imageUrl,
                imageUrls: formData.imageUrls,
                specialty: selectedSpecialties.join(', '),
                vehicleTypes: selectedVehicleTypes.join(', '),
            });
            toast.success('Cập nhật năng lực sửa chữa thành công!');
            router.push('/admin/repairs/capacity');
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
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Cập Nhật Năng Lực Sửa Chữa</h1>
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

                        </div>

                        {/* Image Upload Area */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-gray-700">Ảnh đại diện năng lực (Tối đa 5 ảnh)</Label>

                            {formData.imageUrls.length < 5 && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative h-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-50 hover:border-orange-300 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group mb-4"
                                >
                                    <div className="text-center p-6 space-y-2 text-gray-400 group-hover:text-orange-500 transition-colors">
                                        {isUploading ? (
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                                        ) : (
                                            <>
                                                <ImageIcon className="w-8 h-8 mx-auto" />
                                                <p className="text-sm font-medium">Bấm tải thêm ảnh ({formData.imageUrls.length}/5)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {formData.imageUrls.length > 0 && (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    {formData.imageUrls.map((url, index) => (
                                        <div key={index} className="relative h-32 rounded-2xl border border-gray-200 overflow-hidden group">
                                            <img src={url} className="w-full h-full object-cover" alt={`Năng lực ${index + 1}`} />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                            {index === 0 && (
                                                <span className="absolute bottom-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-md">Ảnh chính</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                multiple
                                className="hidden"
                            />
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

                {/* Service Area / Khu Vực Phục Vụ */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Khu vực phục vụ <span className="text-red-500">*</span></h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Chọn Tỉnh / Thành Phố và thông tin Quận / Huyện để khách hàng tìm kiếm nội bộ chính xác.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="province" className="text-sm font-bold text-gray-700">Tỉnh / TP</Label>
                            <select
                                id="province"
                                name="province"
                                value={formData.province}
                                onChange={handleProvinceChange}
                                className="flex h-12 w-full rounded-xl border border-input bg-gray-50/50 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium text-gray-700"
                            >
                                <option value="">Chọn tỉnh / thành phố</option>
                                {provincesList.map(p => (
                                    <option key={p.code} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="district" className="text-sm font-bold text-gray-700">Quận / Huyện</Label>
                            <select
                                id="district"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                disabled={!formData.province}
                                className="flex h-12 w-full rounded-xl border border-input bg-gray-50/50 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium text-gray-700 disabled:opacity-50"
                            >
                                <option value="">Chọn quận / huyện</option>
                                {districtsList.map((d: any) => (
                                    <option key={d.code} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone" className="text-sm font-bold text-gray-700">Số điện thoại liên hệ <span className="text-red-500">*</span></Label>
                            <Input
                                id="contactPhone"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                className="rounded-xl h-12 bg-gray-50/50 text-base"
                                placeholder="Nhập số điện thoại"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactName" className="text-sm font-bold text-gray-700">Tên liên hệ <span className="text-red-500">*</span></Label>
                            <Input
                                id="contactName"
                                name="contactName"
                                value={formData.contactName}
                                onChange={handleChange}
                                className="rounded-xl h-12 bg-gray-50/50 text-base"
                                placeholder="Nhập tên người liên hệ"
                                required
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
                        Lưu Cập Nhật
                    </Button>
                </div>
            </form>
        </div>
    );
}
