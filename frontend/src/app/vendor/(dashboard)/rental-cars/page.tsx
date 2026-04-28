"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { Pencil, Trash2, Image as ImageIcon, Loader2, Car, Plus, Info, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function VendorRentalCarsPage() {
    const [rentalCars, setRentalCars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedCar, setSelectedCar] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'ready', 'rented'
    const [sortBy, setSortBy] = useState('newest');

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        plate: '',
        price: '',
        description: '',
        status: 'Sẵn sàng',
        imageUrl: '',
    });

    const fetchRentalCars = async () => {
        try {
            setLoading(true);
            const { data } = await http.get('/rental-cars/vendor/me');
            setRentalCars(data || []);
        } catch (error: any) {
            toast.error('Không thể tải danh sách xe thuê');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRentalCars();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const data = new FormData();
        data.append('file', file);
        setIsLoading(true);
        try {
            const res = await http.post('/users/avatar', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, imageUrl: res.data.avatarUrl }));
            toast.success('Tải ảnh thành công');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tải ảnh');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async () => {
        setIsLoading(true);
        try {
            await http.post('/rental-cars', {
                ...formData,
                price: parseFloat(formData.price),
            });
            toast.success('Thêm xe thuê thành công');
            setIsAddOpen(false);
            setFormData({ name: '', type: '', plate: '', price: '', description: '', status: 'Sẵn sàng', imageUrl: '' });
            fetchRentalCars();
        } catch (error) { toast.error('Có lỗi xảy ra'); } finally { setIsLoading(false); }
    };

    const openEdit = (car: any) => {
        setSelectedCar(car);
        setFormData({
            name: car.name || '',
            type: car.type || '',
            plate: car.plate || '',
            price: car.price?.toString() || '',
            description: car.description || '',
            status: car.status || 'Sẵn sàng',
            imageUrl: car.imageUrl || '',
        });
        setIsEditOpen(true);
    };

    const handleEdit = async () => {
        setIsLoading(true);
        try {
            await http.patch(`/rental-cars/${selectedCar.id}`, {
                ...formData,
                price: parseFloat(formData.price),
            });
            toast.success('Cập nhật thông tin xe thành công');
            setIsEditOpen(false);
            fetchRentalCars();
        } catch (error) { toast.error('Có lỗi xảy ra'); } finally { setIsLoading(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa xe này?')) return;
        try {
            await http.delete(`/rental-cars/${id}`);
            toast.success('Xóa xe thành công');
            fetchRentalCars();
        } catch (error) { toast.error('Không thể xóa xe.'); }
    };

    const CarForm = () => (
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold">Tên xe</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} className="rounded-xl h-11" placeholder="VD: Honda Vision 2023" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-bold">Loại xe</Label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                        <option value="">-- Chọn loại --</option>
                        <option value="Xe máy tay ga">Xe máy tay ga</option>
                        <option value="Xe máy số">Xe máy số</option>
                        <option value="Ô tô 4 chỗ">Ô tô 4 chỗ</option>
                        <option value="Ô tô 7 chỗ">Ô tô 7 chỗ</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="plate" className="text-sm font-bold">Biển số</Label>
                    <Input id="plate" name="plate" value={formData.plate} onChange={handleChange} className="rounded-xl h-11" placeholder="VD: 29A-123.45" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-bold">Giá thuê/ngày</Label>
                    <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-bold">Trạng thái</Label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                        <option value="Sẵn sàng">Sẵn sàng</option>
                        <option value="Đang thuê">Đang thuê</option>
                        <option value="Bảo dưỡng">Bảo dưỡng</option>
                    </select>
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-sm font-bold">Hình ảnh xe</Label>
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100">
                        {formData.imageUrl ? <img src={formData.imageUrl} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon /></div>}
                    </div>
                    <Input type="file" onChange={handleFileChange} accept="image/*" className="flex-1 rounded-xl h-11 border-none bg-white shadow-sm" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold">Mô tả thêm</Label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
            </div>
        </div>
    );

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Header Section with Asymmetric Layout */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Cho thuê Xe</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">Quản lý xe cho thuê</h1>
                    <p className="mt-4 text-slate-500 max-w-md leading-relaxed">Quản lý đội xe cho thuê và lịch trình của bạn. Theo dõi trạng thái hoạt động theo thời gian thực.</p>
                </div>
                <button onClick={() => setIsAddOpen(true)} className="bg-blue-50/50 border border-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95 px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 shrink-0">
                    <span className="material-symbols-outlined">add_circle</span>
                    <span>Thêm xe mới</span>
                </button>
            </div>

            {/* Stats Tonal Layering Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-blue-600">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-blue-600">directions_car</span>
                        <span className="text-xs font-bold text-blue-600">Tổng quan</span>
                    </div>
                    <h3 className="mt-4 text-3xl font-bold">{rentalCars.length}</h3>
                    <p className="text-sm text-slate-500 font-medium">Tổng số xe cho thuê</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-emerald-600">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                        <span className="text-xs font-bold text-emerald-600">Sẵn sàng</span>
                    </div>
                    <h3 className="mt-4 text-3xl font-bold">{rentalCars.filter(p => p.status === 'Sẵn sàng').length}</h3>
                    <p className="text-sm text-slate-500 font-medium">Sẵn sàng giao khách</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-amber-500">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-amber-500">key</span>
                        <span className="text-xs font-bold text-amber-500">Đang thuê / Khác</span>
                    </div>
                    <h3 className="mt-4 text-3xl font-bold">{rentalCars.filter(p => p.status !== 'Sẵn sàng').length}</h3>
                    <p className="text-sm text-slate-500 font-medium">Xe đang phục vụ khách</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200/50">
                <div className="flex items-center gap-2">
                    <button onClick={() => setFilter('all')} className={cn("px-5 py-2 rounded-full text-xs font-bold transition-colors", filter === 'all' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}>Tất cả xe</button>
                    <button onClick={() => setFilter('ready')} className={cn("px-5 py-2 rounded-full text-xs font-bold transition-colors", filter === 'ready' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}>Sẵn sàng</button>
                    <button onClick={() => setFilter('rented')} className={cn("px-5 py-2 rounded-full text-xs font-bold transition-colors", filter === 'rented' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}>Đang thuê / Khác</button>
                </div>
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                <span className="material-symbols-outlined text-sm">sort</span>
                                {sortBy === 'newest' ? 'Mới nhất' : sortBy === 'oldest' ? 'Cũ nhất' : sortBy === 'price_desc' ? 'Giá cao nhất' : 'Giá thấp nhất'}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 font-medium text-sm rounded-xl">
                            <DropdownMenuItem onClick={() => setSortBy('newest')} className={cn("rounded-lg cursor-pointer", sortBy === 'newest' ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600")}>Mới nhất</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('oldest')} className={cn("rounded-lg cursor-pointer", sortBy === 'oldest' ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600")}>Cũ nhất</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('price_desc')} className={cn("rounded-lg cursor-pointer", sortBy === 'price_desc' ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600")}>Giá cao nhất</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('price_asc')} className={cn("rounded-lg cursor-pointer", sortBy === 'price_asc' ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600")}>Giá thấp nhất</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {loading ? (
                <div className="flex h-[40vh] items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-blue-600" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rentalCars.filter(p => {
                        if (filter === 'ready') return p.status === 'Sẵn sàng';
                        if (filter === 'rented') return p.status !== 'Sẵn sàng';
                        return true;
                    }).sort((a, b) => {
                        if (sortBy === 'newest') return new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime();
                        if (sortBy === 'oldest') return new Date(a.createdAt || Date.now()).getTime() - new Date(b.createdAt || Date.now()).getTime();
                        if (sortBy === 'price_desc') return b.price - a.price;
                        if (sortBy === 'price_asc') return a.price - b.price;
                        return 0;
                    }).map((rental) => (
                        <div key={rental.id} className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-slate-100">
                            <div className="relative h-64 overflow-hidden">
                                <img src={rental.imageUrl || '/images/static/car-placeholder.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={rental.name} />
                                <div className="absolute top-4 left-4">
                                    <span className={cn("text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg", rental.status === 'Sẵn sàng' ? "bg-emerald-600 text-white shadow-emerald-600/20" : rental.status === 'Đang thuê' ? "bg-amber-500 shadow-amber-500/20" : "bg-slate-600 shadow-slate-600/20")}>
                                        {rental.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold tracking-tight line-clamp-1">{rental.name}</h3>
                                </div>
                                <p className="text-sm font-bold text-slate-500 mb-4 line-clamp-1">{rental.type}</p>
                                
                                <div className="flex gap-4 mb-6">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <span className="material-symbols-outlined text-base">pin</span>
                                        <span className="uppercase tracking-widest">{rental.plate}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-slate-900 font-bold text-lg">{(rental.price || 0).toLocaleString('vi-VN')} <span className="text-[10px] text-slate-400 align-top ml-0.5">VNĐ / Ngày</span></span>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(rental)} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 w-8 h-8 rounded flex items-center justify-center transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete(rental.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 w-8 h-8 rounded flex items-center justify-center transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
                    <DialogHeader className="bg-blue-600 text-white px-10 py-8 text-white">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Thêm xe thuê mới</DialogTitle>
                    </DialogHeader>
                    <div className="p-10"><CarForm /></div>
                    <DialogFooter className="bg-gray-50 px-10 py-6">
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold">Hủy</Button>
                        <Button onClick={handleAdd} disabled={isLoading} className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 px-8 font-black">Lưu thông tin</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
                    <DialogHeader className="bg-emerald-600 px-10 py-8 text-white">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Cập nhật xe</DialogTitle>
                    </DialogHeader>
                    <div className="p-10"><CarForm /></div>
                    <DialogFooter className="bg-gray-50 px-10 py-6">
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl font-bold">Hủy</Button>
                        <Button onClick={handleEdit} disabled={isLoading} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-8 font-black">Cập nhật ngay</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
