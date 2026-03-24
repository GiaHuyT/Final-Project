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

export default function VendorRentalCarsPage() {
    const [rentalCars, setRentalCars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedCar, setSelectedCar] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

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
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Cho thuê Xe</h1>
                    <p className="text-muted-foreground font-medium">Quản lý đội xe cho thuê và lịch trình của bạn.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="rounded-xl bg-blue-600 hover:bg-blue-700 h-12 px-6 font-bold gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95">
                    <Plus className="w-5 h-5" /> Thêm xe mới
                </Button>
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
                                                    <img src={rental.imageUrl || '/placeholder-car.jpg'} className="w-full h-full object-cover" />
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 align-middle">
                                                <div className="font-black text-gray-900 text-base">{rental.name}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{rental.type}</div>
                                            </td>
                                            <td className="px-10 py-6 align-middle font-black text-gray-600 tracking-tighter uppercase">{rental.plate}</td>
                                            <td className="px-10 py-6 align-middle text-center">
                                                <div className="font-black text-blue-600">{(rental.price || 0).toLocaleString()} <span className="text-[10px] opacity-60">đ/ngày</span></div>
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
                                                <Button size="icon" variant="outline" onClick={() => openEdit(rental)} className="w-9 h-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 border-gray-100">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
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

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
                    <DialogHeader className="bg-blue-600 px-10 py-8 text-white">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Thêm xe thuê mới</DialogTitle>
                    </DialogHeader>
                    <div className="p-10"><CarForm /></div>
                    <DialogFooter className="bg-gray-50 px-10 py-6">
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold">Hủy</Button>
                        <Button onClick={handleAdd} disabled={isLoading} className="rounded-xl bg-blue-600 hover:bg-blue-700 px-8 font-black">Lưu thông tin</Button>
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
