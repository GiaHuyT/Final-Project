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
        stock: '',
        description: '',
        status: true,
        imageUrl: '',
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
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
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
        });
        setIsEditOpen(true);
    };

    const handleEdit = async () => {
        setIsLoading(true);
        try {
            await http.patch(`/products/${selectedProduct.id}`, {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 py-6">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Tên sản phẩm</Label>
                <Input 
                    id="name" 
                    name="name" 
                    placeholder="Ví dụ: Porsche 911 GT3 RS"
                    value={formData.name} 
                    onChange={handleChange} 
                    className="focus:ring-orange-500/20 focus:border-orange-500"
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="categoryId" className="text-sm font-semibold text-gray-700">Danh mục</Label>
                <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:border-orange-500"
                >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold text-gray-700">Giá bán (VNĐ)</Label>
                <div className="relative">
                    <Input 
                        id="price" 
                        name="price" 
                        type="number" 
                        placeholder="0"
                        value={formData.price} 
                        onChange={handleChange} 
                        className="pl-8 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₫</span>
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-semibold text-gray-700">Số lượng tồn kho</Label>
                <Input 
                    id="stock" 
                    name="stock" 
                    type="number" 
                    placeholder="0"
                    value={formData.stock} 
                    onChange={handleChange} 
                    className="focus:ring-orange-500/20 focus:border-orange-500"
                />
            </div>
            
            <div className="md:col-span-2 space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Hình ảnh sản phẩm</Label>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="shrink-0">
                        {formData.imageUrl ? (
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-white shadow-sm group">
                                <img src={formData.imageUrl} alt="preview" className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="text-white text-xs font-medium">Thay đổi</span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-32 h-32 bg-white rounded-lg border border-gray-100 flex flex-col items-center justify-center text-gray-400 shadow-inner">
                                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                <span className="text-[10px] uppercase tracking-wider font-bold">Chưa có ảnh</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-3 w-full">
                        <p className="text-xs text-gray-500">Tải lên hình ảnh rõ nét của sản phẩm. Định dạng: JPG, PNG, WEBP (Tối đa 2MB).</p>
                        <Input 
                            type="file" 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="text-xs file:bg-orange-50 file:text-orange-600 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 hover:file:bg-orange-100 cursor-pointer" 
                        />
                    </div>
                </div>
            </div>
            
            <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Mô tả sản phẩm</Label>
                <textarea
                    id="description"
                    name="description"
                    placeholder="Mô tả chi tiết về sản phẩm của bạn..."
                    value={formData.description}
                    onChange={handleChange}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:border-orange-500 transition-all"
                />
            </div>
            
            <div className="md:col-span-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                <div className="flex items-center space-x-3">
                    <input 
                        type="checkbox" 
                        id="status" 
                        name="status" 
                        checked={formData.status} 
                        onChange={handleChange} 
                        className="w-5 h-5 text-orange-600 border-gray-300 rounded-md focus:ring-orange-500 cursor-pointer" 
                    />
                    <div>
                        <label htmlFor="status" className="text-sm font-bold text-gray-800 cursor-pointer">Kích hoạt bán ngay</label>
                        <p className="text-[11px] text-gray-500">Sản phẩm sẽ hiển thị trên sàn ngay sau khi lưu.</p>
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
