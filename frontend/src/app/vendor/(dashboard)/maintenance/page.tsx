"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { Pencil, Trash2, Loader2, Wrench, Plus, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function VendorMaintenancePage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        status: 'Hoạt động',
    });

    const fetchServices = async () => {
        try {
            setLoading(true);
            const { data } = await http.get('/maintenance/vendor/me');
            setServices(data || []);
        } catch (error: any) {
            toast.error('Không thể tải danh sách dịch vụ bảo dưỡng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAdd = async () => {
        if (!formData.name) {
            toast.error('Vui lòng nhập tên dịch vụ');
            return;
        }
        setIsLoading(true);
        try {
            await http.post('/maintenance', {
                ...formData,
                price: parseFloat(formData.price) || 0,
            });
            toast.success('Thêm dịch vụ thành công');
            setIsAddOpen(false);
            setFormData({ name: '', price: '', description: '', status: 'Hoạt động' });
            fetchServices();
        } catch (error) { toast.error('Có lỗi xảy ra'); } finally { setIsLoading(false); }
    };

    const openEdit = (service: any) => {
        setSelectedService(service);
        setFormData({
            name: service.name || '',
            price: service.price?.toString() || '',
            description: service.description || '',
            status: service.status || 'Hoạt động',
        });
        setIsEditOpen(true);
    };

    const handleEdit = async () => {
        if (!formData.name) {
            toast.error('Vui lòng nhập tên dịch vụ');
            return;
        }
        setIsLoading(true);
        try {
            await http.patch(`/maintenance/${selectedService.id}`, {
                ...formData,
                price: parseFloat(formData.price) || 0,
            });
            toast.success('Cập nhật dịch vụ thành công');
            setIsEditOpen(false);
            fetchServices();
        } catch (error) { toast.error('Có lỗi xảy ra'); } finally { setIsLoading(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
        try {
            await http.delete(`/maintenance/${id}`);
            toast.success('Xóa dịch vụ thành công');
            fetchServices();
        } catch (error) { toast.error('Không thể xóa dịch vụ.'); }
    };

    const ServiceForm = () => (
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold">Tên dịch vụ bảo dưỡng</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} className="rounded-xl h-11" placeholder="VD: Bảo dưỡng cấp 1 (5000km)" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-bold">Giá dịch vụ (VNĐ)</Label>
                    <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-bold">Trạng thái</Label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                        <option value="Hoạt động">Công khai</option>
                        <option value="Tạm ngưng">Bản nháp</option>
                    </select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold">Mô tả chi tiết</Label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Mô tả các hạng mục bảo dưỡng..." />
            </div>
        </div>
    );

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Dịch vụ Bảo dưỡng</h1>
                    <p className="text-muted-foreground font-medium">Quản lý các gói dịch vụ bảo dưỡng xe mà bạn cung cấp.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsAddOpen(true)} className="rounded-xl border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95 h-12 px-6 font-bold gap-2">
                        <Plus className="w-5 h-5" /> Thêm Dịch vụ mới
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex h-96 items-center justify-center"><Loader2 className="h-14 w-14 animate-spin text-blue-600" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.length === 0 ? (
                        <div className="col-span-full py-24 text-center text-gray-400 font-bold italic bg-white rounded-[2.5rem] border border-dashed border-gray-200 shadow-xl shadow-gray-100/50">
                            Bạn chưa đăng tải dịch vụ bảo dưỡng nào.
                        </div>
                    ) : (
                        services.map((service) => (
                            <div key={service.id} className="group bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-500">
                                <div className="h-40 bg-blue-50/50 relative overflow-hidden flex items-center justify-center">
                                    <Wrench className="w-16 h-16 text-blue-200 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-5 right-5 flex gap-2">
                                        <Button variant="secondary" size="icon" onClick={() => openEdit(service)} className="h-10 w-10 bg-white/90 backdrop-blur hover:bg-white text-blue-600 shadow-xl rounded-full">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="secondary" size="icon" onClick={() => handleDelete(service.id)} className="h-10 w-10 bg-white/90 backdrop-blur hover:bg-white text-red-600 shadow-xl rounded-full">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="absolute bottom-4 left-5">
                                        <Badge className={`rounded-full px-4 py-1.5 uppercase text-[9px] font-black shadow-lg border-none ${service.status === 'Hoạt động' ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>
                                            {service.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="font-black text-gray-900 text-xl mb-3 line-clamp-1">{service.name}</h3>
                                    <p className="text-sm font-medium text-gray-400 mb-6 line-clamp-2 min-h-[40px] leading-relaxed">{service.description || 'Chưa cung cấp mô tả chi tiết.'}</p>
                                    <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                                        <div className="flex items-center gap-1 text-blue-400"><Star className="w-4 h-4 fill-current" /><span className="text-xs font-black text-gray-900">5.0</span></div>
                                        <div className="font-black text-blue-600 text-2xl">{(service.price || 0).toLocaleString('vi-VN')} <span className="text-[10px] opacity-60 ml-1">VNĐ</span></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
                    <DialogHeader className="bg-blue-600 px-10 py-8 text-white">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Thêm dịch vụ bảo dưỡng</DialogTitle>
                    </DialogHeader>
                    <div className="p-10"><ServiceForm /></div>
                    <DialogFooter className="bg-gray-50 px-10 py-6">
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold">Hủy bỏ</Button>
                        <Button onClick={handleAdd} disabled={isLoading} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-8 font-black">Lưu dịch vụ</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
                    <DialogHeader className="bg-blue-600 text-white px-10 py-8 text-white">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Cập nhật dịch vụ</DialogTitle>
                    </DialogHeader>
                    <div className="p-10"><ServiceForm /></div>
                    <DialogFooter className="bg-gray-50 px-10 py-6">
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl font-bold">Hủy bỏ</Button>
                        <Button onClick={handleEdit} disabled={isLoading} className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 px-8 font-black">Cập nhật ngay</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
