import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { Pencil, Trash2, Image as ImageIcon, Plus } from 'lucide-react';

interface ProductsTabProps {
    products: any[];
    onRefresh: () => void;
}

export default function ProductsTab({ products, onRefresh }: ProductsTabProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        price: '',
        stock: '1', // Mặc định 1 cho xe
        description: '',
        status: true,
        imageUrl: '',
        // Thông tin xe bổ sung
        brand: '',
        modelName: '',
        version: '',
        year: new Date().getFullYear().toString(),
        condition: 'Xe mới',
        mileage: '0',
        color: '',
        bodyType: '',
        // Thông số động cơ
        fuelType: '',
        engineCapacity: '',
        maxPower: '',
        maxTorque: '',
        transmission: '',
        driveType: '',
        // Thông số kích thước
        length: '',
        width: '',
        height: '',
        wheelbase: '',
        groundClearance: '',
        // Nhiên liệu
        fuelTankCapacity: '',
        avgFuelConsumption: '',
    });

    useEffect(() => {
        // Fetch categories when component mounts
        http.get('/categories').then(res => {
            setCategories(res.data);
        }).catch(err => console.error(err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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
            // Reusing the avatar endpoint which just uploads any file and returns the url
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
            await http.post('/products', {
                ...formData,
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                year: parseInt(formData.year) || undefined,
                mileage: parseFloat(formData.mileage) || 0,
                length: parseFloat(formData.length) || undefined,
                width: parseFloat(formData.width) || undefined,
                height: parseFloat(formData.height) || undefined,
                wheelbase: parseFloat(formData.wheelbase) || undefined,
                groundClearance: parseFloat(formData.groundClearance) || undefined,
                fuelTankCapacity: parseFloat(formData.fuelTankCapacity) || undefined,
                avgFuelConsumption: parseFloat(formData.avgFuelConsumption) || undefined,
            });
            toast.success('Thêm sản phẩm thành công');
            setIsAddOpen(false);
            setFormData({ name: '', categoryId: '', price: '', stock: '', description: '', status: true, imageUrl: '' });
            onRefresh();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    const openEdit = (prod: any) => {
        setSelectedProduct(prod);
        setFormData({
            name: prod.name,
            categoryId: prod.categoryId?.toString() || '',
            price: prod.price.toString(),
            stock: prod.stock.toString(),
            description: prod.description || '',
            status: prod.status,
            imageUrl: prod.imageUrl || '',
            brand: prod.brand || '',
            modelName: prod.modelName || '',
            version: prod.version || '',
            year: prod.year?.toString() || '',
            condition: prod.condition || 'Xe mới',
            mileage: prod.mileage?.toString() || '0',
            color: prod.color || '',
            bodyType: prod.bodyType || '',
            fuelType: prod.fuelType || '',
            engineCapacity: prod.engineCapacity || '',
            maxPower: prod.maxPower || '',
            maxTorque: prod.maxTorque || '',
            transmission: prod.transmission || '',
            driveType: prod.driveType || '',
            length: prod.length?.toString() || '',
            width: prod.width?.toString() || '',
            height: prod.height?.toString() || '',
            wheelbase: prod.wheelbase?.toString() || '',
            groundClearance: prod.groundClearance?.toString() || '',
            fuelTankCapacity: prod.fuelTankCapacity?.toString() || '',
            avgFuelConsumption: prod.avgFuelConsumption?.toString() || '',
        });
        setIsEditOpen(true);
    };

    const handleEdit = async () => {
        setIsLoading(true);
        try {
            await http.patch(`/products/${selectedProduct.id}`, {
                ...formData,
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                year: parseInt(formData.year) || undefined,
                mileage: parseFloat(formData.mileage) || 0,
                length: parseFloat(formData.length) || undefined,
                width: parseFloat(formData.width) || undefined,
                height: parseFloat(formData.height) || undefined,
                wheelbase: parseFloat(formData.wheelbase) || undefined,
                groundClearance: parseFloat(formData.groundClearance) || undefined,
                fuelTankCapacity: parseFloat(formData.fuelTankCapacity) || undefined,
                avgFuelConsumption: parseFloat(formData.avgFuelConsumption) || undefined,
            });
            toast.success('Cập nhật sản phẩm thành công');
            setIsEditOpen(false);
            onRefresh();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
        try {
            await http.delete(`/products/${id}`);
            toast.success('Xóa sản phẩm thành công');
            onRefresh();
        } catch (error) {
            toast.error('Không thể xóa sản phẩm. Có thể có đơn hàng đang liên kết.');
        }
    };

    const ProductForm = () => (
        <div className="space-y-8 py-6">
            {/* 1. Thông tin cơ bản */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-orange-600 border-l-4 border-orange-600 pl-3">1. Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Tên xe hiển thị</Label>
                        <Input id="name" name="name" placeholder="Ví dụ: Porsche 911 GT3 RS 2024" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="brand" className="text-sm font-semibold text-gray-700">Hãng xe (Brand)</Label>
                        <Input id="brand" name="brand" placeholder="Ví dụ: Porsche" value={formData.brand} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="modelName" className="text-sm font-semibold text-gray-700">Dòng xe (Model)</Label>
                        <Input id="modelName" name="modelName" placeholder="Ví dụ: 911 GT3 RS" value={formData.modelName} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="version" className="text-sm font-semibold text-gray-700">Phiên bản</Label>
                        <Input id="version" name="version" placeholder="Ví dụ: Weissach Package" value={formData.version} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="year" className="text-sm font-semibold text-gray-700">Năm sản xuất</Label>
                        <Input id="year" name="year" type="number" value={formData.year} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="categoryId" className="text-sm font-semibold text-gray-700">Danh mục</Label>
                        <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price" className="text-sm font-semibold text-gray-700">Giá bán (VNĐ)</Label>
                        <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="condition" className="text-sm font-semibold text-gray-700">Tình trạng</Label>
                        <select id="condition" name="condition" value={formData.condition} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="Xe mới">Xe mới</option>
                            <option value="Xe cũ">Xe cũ</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mileage" className="text-sm font-semibold text-gray-700">Số km đã đi</Label>
                        <Input id="mileage" name="mileage" type="number" value={formData.mileage} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="color" className="text-sm font-semibold text-gray-700">Màu xe</Label>
                        <Input id="color" name="color" value={formData.color} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bodyType" className="text-sm font-semibold text-gray-700">Loại xe</Label>
                        <select id="bodyType" name="bodyType" value={formData.bodyType} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">-- Chọn loại xe --</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Hatchback">Hatchback</option>
                            <option value="Pickup">Pickup</option>
                            <option value="Coupe">Coupe</option>
                            <option value="Convertible">Convertible</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stock" className="text-sm font-semibold text-gray-700">Số lượng (Tồn kho)</Label>
                        <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} />
                    </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Hình ảnh xe</Label>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                        <div className="shrink-0">
                            {formData.imageUrl ? (
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                                    <img src={formData.imageUrl} alt="preview" className="object-cover w-full h-full" />
                                </div>
                            ) : (
                                <div className="w-32 h-32 bg-white rounded-lg border border-gray-100 flex flex-col items-center justify-center text-gray-400">
                                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                    <span className="text-[10px] font-bold">CHƯA CÓ ẢNH</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-3 w-full">
                            <Input type="file" onChange={handleFileChange} accept="image/*" className="text-xs" />
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Mô tả chi tiết</Label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
            </div>

            {/* 2. Thông số động cơ */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-600 border-l-4 border-blue-600 pl-3">2. Thông số động cơ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="fuelType" className="text-sm font-semibold text-gray-700">Loại nhiên liệu</Label>
                        <select id="fuelType" name="fuelType" value={formData.fuelType} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">-- Chọn nhiên liệu --</option>
                            <option value="Xăng">Xăng</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Điện">Điện</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="engineCapacity" className="text-sm font-semibold text-gray-700">Dung tích động cơ</Label>
                        <Input id="engineCapacity" name="engineCapacity" placeholder="Ví dụ: 3,996 cc" value={formData.engineCapacity} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxPower" className="text-sm font-semibold text-gray-700">Công suất tối đa</Label>
                        <Input id="maxPower" name="maxPower" placeholder="Ví dụ: 525 PS" value={formData.maxPower} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxTorque" className="text-sm font-semibold text-gray-700">Mô men xoắn cực đại</Label>
                        <Input id="maxTorque" name="maxTorque" placeholder="Ví dụ: 465 Nm" value={formData.maxTorque} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="transmission" className="text-sm font-semibold text-gray-700">Hộp số</Label>
                        <select id="transmission" name="transmission" value={formData.transmission} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">-- Chọn hộp số --</option>
                            <option value="Số sàn">Số sàn</option>
                            <option value="Tự động">Tự động</option>
                            <option value="CVT">CVT</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="driveType" className="text-sm font-semibold text-gray-700">Dẫn động</Label>
                        <select id="driveType" name="driveType" value={formData.driveType} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">-- Chọn dẫn động --</option>
                            <option value="FWD">Cầu trước (FWD)</option>
                            <option value="RWD">Cầu sau (RWD)</option>
                            <option value="AWD">Bốn bánh (AWD)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 3. Thông số kích thước */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-green-600 border-l-4 border-green-600 pl-3">3. Thông số kích thước</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="length" className="text-sm font-semibold text-gray-700">Chiều dài (mm)</Label>
                        <Input id="length" name="length" type="number" value={formData.length} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="width" className="text-sm font-semibold text-gray-700">Chiều rộng (mm)</Label>
                        <Input id="width" name="width" type="number" value={formData.width} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="height" className="text-sm font-semibold text-gray-700">Chiều cao (mm)</Label>
                        <Input id="height" name="height" type="number" value={formData.height} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wheelbase" className="text-sm font-semibold text-gray-700">Chiều dài cơ sở (mm)</Label>
                        <Input id="wheelbase" name="wheelbase" type="number" value={formData.wheelbase} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="groundClearance" className="text-sm font-semibold text-gray-700">Khoảng sáng gầm xe (mm)</Label>
                        <Input id="groundClearance" name="groundClearance" type="number" value={formData.groundClearance} onChange={handleChange} />
                    </div>
                </div>
            </div>

            {/* 4. Nhiên liệu */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-teal-600 border-l-4 border-teal-600 pl-3">4. Nhiên liệu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="fuelTankCapacity" className="text-sm font-semibold text-gray-700">Dung tích bình nhiên liệu (Lít)</Label>
                        <Input id="fuelTankCapacity" name="fuelTankCapacity" type="number" value={formData.fuelTankCapacity} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="avgFuelConsumption" className="text-sm font-semibold text-gray-700">Tiêu hao nhiên liệu TB (L/100km)</Label>
                        <Input id="avgFuelConsumption" name="avgFuelConsumption" type="number" value={formData.avgFuelConsumption} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                    <input type="checkbox" id="status" name="status" checked={formData.status} onChange={handleChange} className="w-5 h-5 text-orange-600 border-gray-300 rounded" />
                    <div>
                        <label htmlFor="status" className="text-sm font-bold text-gray-800">Hiển thị sản phẩm công khai</label>
                        <p className="text-[11px] text-gray-500">Người mua sẽ thấy sản phẩm này trên sàn đấu giá.</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Quản lý sản phẩm</h2>
                <Button onClick={() => setIsAddOpen(true)} className="bg-[#E65E2C] hover:bg-[#d95222] text-white">Thêm sản phẩm mới</Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID</th>
                            <th scope="col" className="px-6 py-3">Hình ảnh</th>
                            <th scope="col" className="px-6 py-3">Tên sản phẩm</th>
                            <th scope="col" className="px-6 py-3">Danh mục</th>
                            <th scope="col" className="px-6 py-3">Giá</th>
                            <th scope="col" className="px-6 py-3">Tồn kho</th>
                            <th scope="col" className="px-6 py-3">Trạng thái</th>
                            <th scope="col" className="px-6 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 && (
                            <tr><td colSpan={8} className="px-6 py-4 text-center text-gray-500">Chưa có sản phẩm nào.</td></tr>
                        )}
                        {products.map((prod) => (
                            <tr key={prod.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">#{prod.id}</td>
                                <td className="px-6 py-4">
                                    <img src={prod.imageUrl || 'https://via.placeholder.com/40'} alt={prod.name} className="w-10 h-10 rounded-md object-cover border border-gray-100" />
                                </td>
                                <td className="px-6 py-4">{prod.name}</td>
                                <td className="px-6 py-4">{prod.category?.name || '---'}</td>
                                <td className="px-6 py-4 font-semibold text-orange-600">{prod.price.toLocaleString('vi-VN')}đ</td>
                                <td className="px-6 py-4">{prod.stock}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${prod.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {prod.status ? 'Còn hàng' : 'Ngừng bán'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                    <Button variant="outline" size="icon" onClick={() => openEdit(prod)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => handleDelete(prod.id)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[800px] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-orange-600 px-6 py-4">
                        <DialogHeader>
                            <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                                <Plus className="w-5 h-5 bg-white/20 p-1 rounded-md" />
                                Thêm sản phẩm mới
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <div className="px-6">
                        <ProductForm />
                    </div>
                    <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="hover:bg-gray-200">Đóng</Button>
                        <Button onClick={handleAdd} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 shadow-lg shadow-orange-200">
                            {isLoading ? "Đang xử lý..." : "Thêm vào sàn bán"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Product Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[800px] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-blue-600 px-6 py-4">
                        <DialogHeader>
                            <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                                <Pencil className="w-5 h-5 bg-white/20 p-1 rounded-md" />
                                Cập nhật sản phẩm
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <div className="px-6">
                        <ProductForm />
                    </div>
                    <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="hover:bg-gray-200">Hủy bỏ</Button>
                        <Button onClick={handleEdit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-200">
                            {isLoading ? "Đang xử lý..." : "Lưu thay đổi"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
