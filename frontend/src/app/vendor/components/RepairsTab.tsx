import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { Pencil, Trash2, Image as ImageIcon } from 'lucide-react';

interface RepairsTabProps {
    repairs: any[];
    onRefresh: () => void;
}

export default function RepairsTab({ repairs, onRefresh }: RepairsTabProps) {
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn tệp ảnh hợp lệ!');
            return;
        }

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
            await http.post('/repairs', {
                ...formData,
                price: parseFloat(formData.price),
            });
            toast.success('Thêm dịch vụ sửa chữa thành công');
            setIsAddOpen(false);
            setFormData({ name: '', price: '', description: '', status: 'Hoạt động', imageUrl: '' });
            onRefresh();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
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
            onRefresh();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
        try {
            await http.delete(`/repairs/${id}`);
            toast.success('Xóa dịch vụ thành công');
            onRefresh();
        } catch (error) {
            toast.error('Không thể xóa dịch vụ.');
        }
    };

    const RepairForm = () => (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Tên dịch vụ</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" placeholder="VD: Thay nhớt Castrol" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Giá dịch vụ (VNĐ)</Label>
                <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Hình ảnh minh họa</Label>
                <div className="col-span-3 flex items-center gap-4">
                    {formData.imageUrl ? (
                        <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                            <img src={formData.imageUrl} alt="preview" className="object-cover w-full h-full" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-gray-50 rounded-md border border-dashed flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                    )}
                    <Input type="file" onChange={handleFileChange} accept="image/*" className="flex-1" />
                </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Mô tả</Label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Trạng thái</Label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm ngưng">Tạm ngưng</option>
                </select>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Dịch vụ sửa chữa</h2>
                <Button onClick={() => setIsAddOpen(true)} className="bg-[#E65E2C] hover:bg-[#d95222] text-white">Thêm dịch vụ mới</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repairs.length === 0 && (
                    <div className="col-span-full py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        Chưa có dịch vụ sửa chữa nào.
                    </div>
                )}
                {repairs.map((repair) => (
                    <div key={repair.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-40 bg-gray-100 relative">
                            {repair.imageUrl ? (
                                <img src={repair.imageUrl} alt={repair.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                    <span className="text-xs font-medium uppercase tracking-wider">Không có ảnh</span>
                                </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2">
                                <Button variant="secondary" size="icon" onClick={() => openEdit(repair)} className="h-8 w-8 bg-white/90 backdrop-blur hover:bg-white text-blue-600 shadow-sm">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="secondary" size="icon" onClick={() => handleDelete(repair.id)} className="h-8 w-8 bg-white/90 backdrop-blur hover:bg-white text-red-600 shadow-sm">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-900 text-lg leading-tight">{repair.name}</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">{repair.description || 'Không có mô tả'}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${repair.status === 'Hoạt động' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {repair.status}
                                </span>
                                <span className="font-bold text-orange-600 text-lg">{(repair.price || 0).toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Repair Modal */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Thêm dịch vụ sửa chữa</DialogTitle>
                    </DialogHeader>
                    <RepairForm />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
                        <Button onClick={handleAdd} disabled={isLoading} className="bg-[#E65E2C] hover:bg-[#d95222] text-white">
                            {isLoading ? "Đang xử lý..." : "Thêm mới"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Repair Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Cập nhật dịch vụ</DialogTitle>
                    </DialogHeader>
                    <RepairForm />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
                        <Button onClick={handleEdit} disabled={isLoading} className="bg-[#E65E2C] hover:bg-[#d95222] text-white">
                            {isLoading ? "Đang xử lý..." : "Lưu thay đổi"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
