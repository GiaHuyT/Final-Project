"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import http from '@/lib/http';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, Save, UserCircle, Briefcase, FileText, Image as ImageIcon } from 'lucide-react';

export default function AdminAddDriverRentalPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    const avatarRef = useRef<HTMLInputElement>(null);
    const licenseFrontRef = useRef<HTMLInputElement>(null);
    const licenseBackRef = useRef<HTMLInputElement>(null);
    const idCardFrontRef = useRef<HTMLInputElement>(null);
    const idCardBackRef = useRef<HTMLInputElement>(null);
    const criminalRecordRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        experienceYears: '',
        pricePerKm: '',
        status: 'Hoạt động',
        avatarUrl: '',
        licenseFrontUrl: '',
        licenseBackUrl: '',
        idCardFrontUrl: '',
        idCardBackUrl: '',
        criminalRecordUrl: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingField(fieldName);
        try {
            const data = new FormData();
            data.append('file', file);
            const res = await http.post('/users/avatar', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, [fieldName]: res.data.avatarUrl }));
            toast.success('Tải ảnh thành công!');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tải ảnh lên.');
        } finally {
            setUploadingField(null);
            if (event.target) event.target.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Vui lòng nhập tên tài xế hoặc đơn vị.');
            return;
        }

        setIsLoading(true);
        try {
            await http.post('/driver-rental', {
                name: formData.name,
                dob: formData.dob,
                experienceYears: parseInt(formData.experienceYears) || 0,
                pricePerKm: parseFloat(formData.pricePerKm) || 0,
                status: formData.status,
                avatarUrl: formData.avatarUrl,
                licenseFrontUrl: formData.licenseFrontUrl,
                licenseBackUrl: formData.licenseBackUrl,
                idCardFrontUrl: formData.idCardFrontUrl,
                idCardBackUrl: formData.idCardBackUrl,
                criminalRecordUrl: formData.criminalRecordUrl,
            });
            toast.success('Thêm đối tác lái thuê thành công!');
            router.push('/admin/driver-rental');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu đối tác.');
        } finally {
            setIsLoading(false);
        }
    };

    const ImageUploadBox = ({ title, fieldName, refVar }: { title: string, fieldName: keyof typeof formData, refVar: React.RefObject<HTMLInputElement | null> }) => (
        <div className="space-y-3">
            <Label className="text-sm font-bold text-gray-700">{title}</Label>
            <div
                onClick={() => refVar.current?.click()}
                className="relative h-40 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-50 hover:border-emerald-300 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group mb-4"
            >
                {formData[fieldName] ? (
                    <img src={formData[fieldName]} className="w-full h-full object-cover" alt={title} />
                ) : (
                    <div className="text-center p-6 space-y-2 text-gray-400 group-hover:text-emerald-500 transition-colors">
                        {uploadingField === fieldName ? (
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                        ) : (
                            <>
                                <ImageIcon className="w-8 h-8 mx-auto" />
                                <p className="text-sm font-medium">Tải ảnh lên</p>
                            </>
                        )}
                    </div>
                )}
            </div>
            {formData[fieldName] && (
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="w-full rounded-xl text-xs"
                    onClick={() => setFormData(prev => ({ ...prev, [fieldName]: '' }))}
                >
                    Xóa ảnh
                </Button>
            )}
            <input
                type="file"
                ref={refVar}
                onChange={(e) => handleFileChange(e, fieldName)}
                accept="image/*"
                className="hidden"
            />
        </div>
    );

    return (
        <div className="container mx-auto py-6 max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-body">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-gray-100 h-12 w-12 text-gray-500">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Thêm Đối Tác Lái Thuê</h1>
                    <p className="text-muted-foreground font-medium">Đăng ký thông tin tài xế phục vụ cho nhu cầu thuê lái xe.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Thẻ thông tin chung */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <UserCircle className="w-48 h-48" />
                    </div>

                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Thông Tin Tài Xế</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold text-gray-700">Tên tài xế / Đơn vị <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="rounded-xl h-12 bg-gray-50/50 text-base"
                                placeholder="VD: Nguyễn Văn A"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dob" className="text-sm font-bold text-gray-700">Ngày tháng năm sinh</Label>
                            <Input
                                id="dob"
                                name="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                                className="rounded-xl h-12 bg-gray-50/50 text-base"
                            />
                        </div>

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
                            <Label htmlFor="pricePerKm" className="text-sm font-bold text-gray-700">Giá thuê (VNĐ/Km)</Label>
                            <Input
                                id="pricePerKm"
                                name="pricePerKm"
                                type="number"
                                min="0"
                                value={formData.pricePerKm}
                                onChange={handleChange}
                                className="rounded-xl h-12 bg-gray-50/50 text-base"
                                placeholder="VD: 15000"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="status" className="text-sm font-bold text-gray-700">Trạng thái hồ sơ</Label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="flex h-12 w-full rounded-xl border border-input bg-gray-50/50 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium text-gray-700"
                            >
                                <option value="Hoạt động">Công khai (Khách hàng có thể thấy)</option>
                                <option value="Tạm ngưng">Bản nháp / Đang bận</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Thẻ tải lên tài liệu */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-8 relative z-10">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Hình Ảnh & Giấy Tờ</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ImageUploadBox title="Ảnh chân dung" fieldName="avatarUrl" refVar={avatarRef} />
                        <ImageUploadBox title="Lý lịch tư pháp" fieldName="criminalRecordUrl" refVar={criminalRecordRef} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <ImageUploadBox title="GPLX (Mặt trước)" fieldName="licenseFrontUrl" refVar={licenseFrontRef} />
                        <ImageUploadBox title="GPLX (Mặt sau)" fieldName="licenseBackUrl" refVar={licenseBackRef} />
                        <ImageUploadBox title="CCCD (Mặt trước)" fieldName="idCardFrontUrl" refVar={idCardFrontRef} />
                        <ImageUploadBox title="CCCD (Mặt sau)" fieldName="idCardBackUrl" refVar={idCardBackRef} />
                    </div>
                </div>

                {/* Hành động chân trang */}
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
                        disabled={isLoading || uploadingField !== null}
                        className="h-14 px-10 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 text-white gap-2 transition-all active:scale-95 text-lg"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        Lưu Thông Tin
                    </Button>
                </div>
            </form>
        </div>
    );
}
