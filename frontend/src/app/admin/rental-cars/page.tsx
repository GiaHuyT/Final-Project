"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { Pencil, Trash2, Image as ImageIcon, Loader2, Car, Plus, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function VendorRentalCarsPage() {
    const [rentalCars, setRentalCars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRentalCars = async () => {
        const mockData = [
            {
                id: 1,
                name: "Honda Vision 2023",
                type: "Xe máy tay ga",
                plate: "29A-123.45",
                price: 150000,
                description: "Xe mới bảo dưỡng, chạy êm, tiết kiệm xăng.",
                status: "Sẵn sàng",
                imageUrl: "/images/mock/honda_vision.png"
            },
            {
                id: 2,
                name: "Toyota Vios 2022",
                type: "Ô tô 4 chỗ",
                plate: "30G-567.89",
                price: 800000,
                description: "Xe gia đình, sạch sẽ, bảo hiểm 2 chiều đầy đủ.",
                status: "Sẵn sàng",
                imageUrl: "/images/mock/toyota_vios.png"
            },
            {
                id: 3,
                name: "Kia Sorento 2021",
                type: "Ô tô 7 chỗ",
                plate: "51K-999.99",
                price: 1200000,
                description: "Xe rộng rãi, thích hợp du lịch gia đình.",
                status: "Đang thuê",
                imageUrl: "/images/mock/kia_sorento.png"
            },
            {
                id: 4,
                name: "Yamaha Exciter 155",
                type: "Xe máy số",
                plate: "60B-888.88",
                price: 200000,
                description: "Xe côn tay mạnh mẽ, phù hợp đi phượt.",
                status: "Sẵn sàng",
                imageUrl: "/images/mock/yamaha_exciter.png"
            },
            {
                id: 5,
                name: "Mazda 3 2023",
                type: "Ô tô 4 chỗ",
                plate: "15A-111.22",
                price: 900000,
                description: "Thiết kế trẻ trung, công nghệ an toàn cao cấp.",
                status: "Bảo dưỡng",
                imageUrl: "/images/mock/mazda_3.png"
            }
        ];

        try {
            setLoading(true);
            const { data } = await http.get('/rental-cars/public');
            if (data && data.length > 0) {
                setRentalCars(data);
            } else {
                setRentalCars(mockData);
            }
        } catch (error: any) {
            toast.error('Sử dụng dữ liệu mẫu do không kết nối được API');
            setRentalCars(mockData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRentalCars();
    }, []);


    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa xe này?')) return;
        try {
            await http.delete(`/rental-cars/${id}`);
            toast.success('Xóa xe thành công');
            fetchRentalCars();
        } catch (error) { toast.error('Không thể xóa xe.'); }
    };


    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Quản lý toàn bộ xe thuê</h1>
                    <p className="text-muted-foreground font-medium">Giám sát các dịch vụ xe thuê đang được đăng bởi các nhà cung cấp trên nền tảng.</p>
                </div>
                <Link href="/admin/rental-cars/add">
                    <Button className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-900 transition-colors shadow-sm h-auto">
                        <Plus className="w-5 h-5" /> Thêm xe mới
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
                <div className="px-10 py-8 border-b bg-gray-50/30">
                    <h2 className="text-xl font-black uppercase tracking-widest text-gray-800 flex items-center gap-3">
                        <Car className="w-6 h-6 text-blue-600" />
                        Đội xe hiện tại
                    </h2>
                </div>

                {loading ? (
                    <div className="flex h-96 items-center justify-center"><Loader2 className="h-14 w-14 animate-spin text-blue-600" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-10 py-6">Hình ảnh</th>
                                    <th className="px-10 py-6">xe / phân loại</th>
                                    <th className="px-10 py-6">Biển số</th>
                                    <th className="px-10 py-6 text-center">Giá thuê</th>
                                    <th className="px-10 py-6 text-center">Trạng thái</th>
                                    <th className="px-10 py-6 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rentalCars.length === 0 ? (
                                    <tr><td colSpan={6} className="px-10 py-24 text-center text-gray-400 font-bold italic">Chưa có xe nào trong đội.</td></tr>
                                ) : (
                                    rentalCars.map((rental) => (
                                        <tr key={rental.id} className="hover:bg-blue-50/5 transition-colors group">
                                            <td className="px-10 py-6 align-middle">
                                                <div className="w-16 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-300">
                                                    <img src={rental.imageUrl || '/images/static/car-placeholder.png'} className="w-full h-full object-cover" />

                                                </div>
                                            </td>
                                            <td className="px-10 py-6 align-middle">
                                                <div className="font-black text-gray-900 text-base">{rental.name}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{rental.type}</div>
                                            </td>
                                            <td className="px-10 py-6 align-middle font-black text-gray-600 tracking-tighter uppercase">{rental.plate}</td>
                                            <td className="px-10 py-6 align-middle text-center">
                                                <div className="font-black text-blue-600">{(rental.price || 0).toLocaleString('vi-VN')} <span className="text-[10px] opacity-60">đ/ngày</span></div>
                                            </td>
                                            <td className="px-10 py-6 align-middle text-center">
                                                <Badge className={`rounded-full px-4 py-1 uppercase text-[9px] font-black shadow-sm border-2 ${
                                                    rental.status === 'Sẵn sàng' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    rental.status === 'Đang thuê' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                                                }`}>
                                                    {rental.status}
                                                </Badge>
                                            </td>
                                            <td className="px-10 py-6 align-middle text-right space-x-2">
                                                <Link href={`/admin/rental-cars/${rental.id}/edit`}>
                                                    <Button size="icon" variant="outline" className="w-9 h-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 border-gray-100">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button size="icon" variant="outline" onClick={() => handleDelete(rental.id)} className="w-9 h-9 rounded-xl hover:bg-red-50 hover:text-red-600 border-gray-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


        </div>
    );
}
