import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { Pencil, Trash2, Image as ImageIcon } from 'lucide-react';

interface RentalCarsTabProps {
    rentalCars: any[];
    onRefresh: () => void;
}

export default function RentalCarsTab({ rentalCars, onRefresh }: RentalCarsTabProps) {
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
            await http.post('/rental-cars', {
                ...formData,
                price: parseFloat(formData.price),
            });
            toast.success('Thêm xe thuê thành công');
            setIsAddOpen(false);
            setFormData({ name: '', type: '', plate: '', price: '', description: '', status: 'Sẵn sàng', imageUrl: '' });
            onRefresh();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
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
            onRefresh();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa xe này?')) return;
        try {
            await http.delete(`/rental-cars/${id}`);
            toast.success('Xóa xe thành công');
            onRefresh();
        } catch (error) {
            toast.error('Không thể xóa xe.');
        }
    };

    const CarForm = () => (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Tên xe</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" placeholder="VD: Honda Vision 2023" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Loại xe</Label>
                <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="">-- Chọn loại xe --</option>
                    <option value="Xe máy tay ga">Xe máy tay ga</option>
                    <option value="Xe máy số">Xe máy số</option>
                    <option value="Xe côn tay">Xe côn tay</option>
                    <option value="Ô tô 4 chỗ">Ô tô 4 chỗ</option>
                    <option value="Ô tô 7 chỗ">Ô tô 7 chỗ</option>
                    <option value="Bán tải">Bán tải</option>
                </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plate" className="text-right">Biển số</Label>
                <Input id="plate" name="plate" value={formData.plate} onChange={handleChange} className="col-span-3" placeholder="VD: 29A-123.45" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Giá thuê/ngày</Label>
                <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Hình ảnh</Label>
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
                <Label htmlFor="description" className="text-right">Mô tả thêm</Label>
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
                    <option value="Sẵn sàng">Sẵn sàng</option>
                    <option value="Đang thuê">Đang thuê</option>
                    <option value="Bảo dưỡng">Bảo dưỡng</option>
                </select>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Danh sách xe thuê</h2>
                <Button onClick={() => setIsAddOpen(true)} className="bg-[#E65E2C] hover:bg-[#d95222] text-white">Thêm xe mới</Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th scope="col" className="px-6 py-3">Mã xe</th>
                            <th scope="col" className="px-6 py-3">Hình ảnh</th>
                            <th scope="col" className="px-6 py-3">Tên xe / Loại</th>
                            <th scope="col" className="px-6 py-3">Biển kiểm soát</th>
                            <th scope="col" className="px-6 py-3">Giá thuê</th>
                            <th scope="col" className="px-6 py-3">Trạng thái</th>
                            <th scope="col" className="px-6 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rentalCars.length === 0 && (
                            <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">Chưa có dữ liệu xe thuê.</td></tr>
                        )}
                        {rentalCars.map((rental) => (
                            <tr key={rental.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">#{rental.id}</td>
                                <td className="px-6 py-4">
                                    <img src={rental.imageUrl || 'https://via.placeholder.com/40'} alt={rental.name} className="w-10 h-10 rounded-md object-cover border border-gray-100" />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-800">{rental.name}</div>
                                    <div className="text-xs text-gray-400">{rental.type}</div>
                                </td>
                                <td className="px-6 py-4 font-semibold">{rental.plate}</td>
                                <td className="px-6 py-4 font-semibold text-orange-600">{(rental.price || 0).toLocaleString('vi-VN')}đ/ngày</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                        ${rental.status === 'Sẵn sàng' ? 'bg-green-100 text-green-700' :
                                            rental.status === 'Đang thuê' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {rental.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                    <Button variant="outline" size="icon" onClick={() => openEdit(rental)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => handleDelete(rental.id)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Car Modal */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Thêm xe thuê mới</DialogTitle>
                    </DialogHeader>
                    <CarForm />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
                        <Button onClick={handleAdd} disabled={isLoading} className="bg-[#E65E2C] hover:bg-[#d95222] text-white">
                            {isLoading ? "Đang xử lý..." : "Thêm mới"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Car Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Cập nhật thông tin xe</DialogTitle>
                    </DialogHeader>
                    <CarForm />
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
