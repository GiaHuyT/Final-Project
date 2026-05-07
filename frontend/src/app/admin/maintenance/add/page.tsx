"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import http from '@/lib/http';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, Save, Wrench, Briefcase, FileText } from 'lucide-react';

export default function AdminAddMaintenancePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        status: 'Hoạt động',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Vui lòng nhập tên dịch vụ bảo dưỡng.');
            return;
        }

        setIsLoading(true);
        try {
            await http.post('/maintenance', {
                name: formData.name,
                price: parseFloat(formData.price) || 0,
                description: formData.description,
                status: formData.status,
            });
            toast.success('Thêm dịch vụ bảo dưỡng thành công!');
            router.push('/admin/maintenance');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu dịch vụ.');
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
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Thêm Dịch Vụ Bảo Dưỡng</h1>
                    <p className="text-muted-foreground font-medium">Tạo gói dịch vụ bảo dưỡng định kỳ mới trên hệ thống.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Thẻ thông tin chung */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Wrench className="w-48 h-48" />
                    </div>

                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Thông Tin Chung</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="name" className="text-sm font-bold text-gray-700">Tên dịch vụ <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="rounded-xl h-12 bg-gray-50/50 text-base"
                                placeholder="VD: Gói bảo dưỡng cấp 1 (5000km)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-sm font-bold text-gray-700">Giá dự kiến (VNĐ)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                className="rounded-xl h-12 bg-gray-50/50 text-base"
                                placeholder="VD: 500000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-bold text-gray-700">Trạng thái hiển thị</Label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="flex h-12 w-full rounded-xl border border-input bg-gray-50/50 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-gray-700"
                            >
                                <option value="Hoạt động">Công khai (Hoạt động)</option>
                                <option value="Tạm ngưng">Bản nháp / Tạm ngưng</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Mô tả chi tiết */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-6 relative z-10">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Mô Tả Chi Tiết</h2>
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="description" className="text-sm font-bold text-gray-700">Mô tả thêm về hạng mục bảo dưỡng, các quy trình tiêu chuẩn...</Label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="flex min-h-[200px] w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-base outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-gray-700 resize-none"
                            placeholder="Ví dụ: Thay dầu động cơ, kiểm tra lọc nhớt, đo áp suất lốp, châm nước làm mát..."
                        />
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
                        disabled={isLoading}
                        className="h-14 px-10 rounded-xl font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 text-white gap-2 transition-all active:scale-95 text-lg"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        Lưu Thay Đổi
                    </Button>
                </div>
            </form>
        </div>
    );
}
