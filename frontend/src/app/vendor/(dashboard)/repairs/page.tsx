"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { Pencil, Trash2, Image as ImageIcon, Loader2, Wrench, Plus, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function VendorRepairsPage() {
    const [repairs, setRepairs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedRepair, setSelectedRepair] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        status: 'Hoạt động',
        imageUrl: '',
    });

    const fetchRepairs = async () => {
        try {
            setLoading(true);
            const { data } = await http.get('/repairs/vendor/me');
            setRepairs(data || []);
        } catch (error: any) {
            toast.error('Không thể tải danh sách dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRepairs();
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
        } catch (error) { toast.error('Có lỗi xảy ra khi tải ảnh'); } finally { setIsLoading(false); }
    };

    const handleAdd = async () => {
        setIsLoading(true);
        try {
            await http.post('/repairs', {
                ...formData,
                price: parseFloat(formData.price),
            });
            toast.success('Thêm dịch vụ thành công');
            setIsAddOpen(false);
            setFormData({ name: '', price: '', description: '', status: 'Hoạt động', imageUrl: '' });
            fetchRepairs();
        } catch (error) { toast.error('Có lỗi xảy ra'); } finally { setIsLoading(false); }
    };

    const openEdit = (repair: any) => {
        setSelectedRepair(repair);
        setFormData({
            name: repair.name || '',
            price: repair.price?.toString() || '',
            description: repair.description || '',
            status: repair.status || 'Hoạt động',
            imageUrl: repair.imageUrl || '',
        });
        setIsEditOpen(true);
    };

    const handleEdit = async () => {
        setIsLoading(true);
        try {
            await http.patch(`/repairs/${selectedRepair.id}`, {
                ...formData,
                price: parseFloat(formData.price),
            });
            toast.success('Cập nhật dịch vụ thành công');
            setIsEditOpen(false);
            fetchRepairs();
        } catch (error) { toast.error('Có lỗi xảy ra'); } finally { setIsLoading(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
        try {
            await http.delete(`/repairs/${id}`);
            toast.success('Xóa dịch vụ thành công');
            fetchRepairs();
        } catch (error) { toast.error('Không thể xóa dịch vụ.'); }
    };

    const RepairForm = () => (
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold">Tên dịch vụ sửa chữa</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} className="rounded-xl h-11" placeholder="VD: Bảo dưỡng động cơ định kỳ" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-bold">Giá dịch vụ (VNĐ)</Label>
                    <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-bold">Trạng thái công khai</Label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                        <option value="Hoạt động">Đang hoạt động</option>
                        <option value="Tạm ngưng">Tạm dừng dịch vụ</option>
                    </select>
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-sm font-bold">Hình ảnh minh họa dịch vụ</Label>
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100">
                        {formData.imageUrl ? <img src={formData.imageUrl} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon /></div>}
                    </div>
                    <Input type="file" onChange={handleFileChange} accept="image/*" className="flex-1 rounded-xl h-11 border-none bg-white shadow-sm" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold">Mô tả chi tiết dịch vụ</Label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Mô tả các hạng mục sửa chữa, cam kết chất lượng..." />
            </div>
        </div>
    );

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Dịch vụ Sửa chữa</h1>
                    <p className="text-muted-foreground font-medium">Quản lý danh sách các gói sửa chữa và bảo dưỡng ô tô của bạn.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 h-12 px-6 font-bold gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95">
                    <Plus className="w-5 h-5" /> Thêm dịch vụ mới
                </Button>
            </div>

            {loading ? (
                <div className="flex h-96 items-center justify-center"><Loader2 className="h-14 w-14 animate-spin text-emerald-600" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {repairs.length === 0 ? (
                        <div className="col-span-full py-24 text-center text-gray-400 font-bold italic bg-white rounded-[2.5rem] border border-dashed border-gray-200 shadow-xl shadow-gray-100/50">
                            Bạn chưa đăng tải dịch vụ sửa chữa nào.
                        </div>
                    ) : (
                        repairs.map((repair) => (
                            <div key={repair.id} className="group bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-emerald-200 transition-all duration-500">
                                <div className="h-56 bg-gray-100 relative overflow-hidden">
                                    {repair.imageUrl ? (
                                        <img src={repair.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                            <Wrench className="w-12 h-12 mb-2 opacity-30" />
                                            <span className="text-[10px] uppercase font-black tracking-widest">No Visual</span>
                                        </div>
                                    )}
                                    <div className="absolute top-5 right-5 flex gap-2">
                                        <Button variant="secondary" size="icon" onClick={() => openEdit(repair)} className="h-10 w-10 bg-white/90 backdrop-blur hover:bg-white text-blue-600 shadow-xl rounded-full">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="secondary" size="icon" onClick={() => handleDelete(repair.id)} className="h-10 w-10 bg-white/90 backdrop-blur hover:bg-white text-red-600 shadow-xl rounded-full">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="absolute bottom-4 left-5">
                                        <Badge className={`rounded-full px-4 py-1.5 uppercase text-[9px] font-black shadow-lg border-none ${repair.status === 'Hoạt động' ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>
                                            {repair.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="font-black text-gray-900 text-xl mb-3 line-clamp-1">{repair.name}</h3>
                                    <p className="text-sm font-medium text-gray-400 mb-6 line-clamp-2 min-h-[40px] leading-relaxed">{repair.description || 'Chưa cung cấp mô tả chi tiết cho dịch vụ này.'}</p>
                                    <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                                        <div className="flex items-center gap-1 text-orange-400"><Star className="w-4 h-4 fill-current" /><span className="text-xs font-black text-gray-900">5.0</span></div>
                                        <div className="font-black text-emerald-600 text-2xl">{(repair.price || 0).toLocaleString()} <span className="text-[10px] opacity-60 ml-1">VNĐ</span></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
                    <DialogHeader className="bg-emerald-600 px-10 py-8 text-white">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Thêm dịch vụ sửa chữa</DialogTitle>
                    </DialogHeader>
                    <div className="p-10"><RepairForm /></div>
                    <DialogFooter className="bg-gray-50 px-10 py-6">
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold">Hủy bỏ</Button>
                        <Button onClick={handleAdd} disabled={isLoading} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-8 font-black">Lưu dịch vụ</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
                    <DialogHeader className="bg-blue-600 px-10 py-8 text-white">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Cập nhật dịch vụ</DialogTitle>
                    </DialogHeader>
                    <div className="p-10"><RepairForm /></div>
                    <DialogFooter className="bg-gray-50 px-10 py-6">
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl font-bold">Hủy bỏ</Button>
                        <Button onClick={handleEdit} disabled={isLoading} className="rounded-xl bg-blue-600 hover:bg-blue-700 px-8 font-black">Cập nhật ngay</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
