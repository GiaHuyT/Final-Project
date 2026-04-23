"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import http from '@/lib/http';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, Save, Car, Briefcase, FileText, Image as ImageIcon } from 'lucide-react';

export default function AdminAddRentalCarPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        plate: '',
        price: '',
        description: '',
        status: 'Sẵn sàng',
        imageUrl: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const data = new FormData();
            data.append('file', file);
            const res = await http.post('/users/avatar', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, imageUrl: res.data.avatarUrl }));
            toast.success('Tải ảnh thành công!');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tải ảnh lên.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.plate) {
            toast.error('Vui lòng nhập tên xe và biển số.');
            return;
        }

        setIsLoading(true);
        try {
            await http.post('/rental-cars', {
                ...formData,
                price: parseFloat(formData.price) || 0,
            });
            toast.success('Thêm xe thuê thành công!');
            router.push('/admin/rental-cars');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin xe.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-6 max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-gray-100 h-12 w-12 text-gray-500">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Thêm Xe Thuê Mới</h1>
                    <p className="text-muted-foreground font-medium">Bổ sung phương tiện mới vào đội xe cho thuê của hệ thống.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Information Card */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Car className="w-48 h-48" />
                    </div>

                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Thông Tin Xe</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-bold text-gray-700">Tên xe <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="rounded-xl h-12 bg-gray-50/50 text-base"
                                    placeholder="VD: Honda Vision 2023"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="type" className="text-sm font-bold text-gray-700">Loại xe</Label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="flex h-12 w-full rounded-xl border border-input bg-gray-50/50 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-gray-700"
                                    >
                                        <option value="">-- Chọn loại --</option>
                                        <option value="Xe máy tay ga">Xe máy tay ga</option>
                                        <option value="Xe máy số">Xe máy số</option>
                                        <option value="Ô tô 4 chỗ">Ô tô 4 chỗ</option>
                                        <option value="Ô tô 7 chỗ">Ô tô 7 chỗ</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="plate" className="text-sm font-bold text-gray-700">Biển số <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="plate"
                                        name="plate"
                                        value={formData.plate}
                                        onChange={handleChange}
                                        className="rounded-xl h-12 bg-gray-50/50 text-base font-mono uppercase tracking-widest"
                                        placeholder="VD: 29A-123.45"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-sm font-bold text-gray-700">Giá thuê/ngày (VNĐ)</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="rounded-xl h-12 bg-gray-50/50 text-base"
                                        placeholder="VD: 150000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-sm font-bold text-gray-700">Trạng thái xe</Label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="flex h-12 w-full rounded-xl border border-input bg-gray-50/50 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-gray-700"
                                    >
                                        <option value="Sẵn sàng">Sẵn sàng (Hoạt động)</option>
                                        <option value="Đang thuê">Đang cho thuê</option>
                                        <option value="Bảo dưỡng">Đang bảo dưỡng</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Image Upload Area */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-gray-700">Hình ảnh xe</Label>
                            
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative h-48 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-50 hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group mb-4"
                            >
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Hình xe" />
                                ) : (
                                    <div className="text-center p-6 space-y-2 text-gray-400 group-hover:text-blue-500 transition-colors">
                                        {isUploading ? (
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                                        ) : (
                                            <>
                                                <ImageIcon className="w-8 h-8 mx-auto" />
                                                <p className="text-sm font-medium">Bấm để tải ảnh lên</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            {formData.imageUrl && (
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="w-full rounded-xl"
                                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                >
                                    Xóa ảnh
                                </Button>
                            )}

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

                {/* Detailed Description */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-6 relative z-10">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Mô Tả Thêm</h2>
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="description" className="text-sm font-bold text-gray-700">Thông tin chi tiết, tình trạng xe, phụ kiện đi kèm...</Label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="flex min-h-[150px] w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-base outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-gray-700 resize-none"
                            placeholder="Ví dụ: Xe trầy xước nhẹ ở cản trước, có sẵn 2 mũ bảo hiểm, giao xe đầy bình xăng..."
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
                        className="h-14 px-10 rounded-xl font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 text-white gap-2 transition-all active:scale-95 text-lg"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        Lưu Thông Tin
                    </Button>
                </div>
            </form>
        </div>
    );
}
