"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { Pencil, Trash2, Image as ImageIcon, Plus, Loader2, X, ChevronRight, Car, Settings, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CAR_COLORS = [
    { name: 'Trắng', hex: '#FFFFFF' }, { name: 'Đen', hex: '#000000' }, { name: 'Bạc', hex: '#C0C0C0' },
    { name: 'Xám', hex: '#808080' }, { name: 'Đỏ', hex: '#FF0000' }, { name: 'Xanh dương', hex: '#0000FF' },
    { name: 'Nâu', hex: '#A52A2A' }, { name: 'Vàng cát', hex: '#F5F5DC' }, { name: 'Xanh lá', hex: '#008000' },
    { name: 'Vàng', hex: '#FFFF00' }, { name: 'Cam', hex: '#FFA500' },
];

export default function VendorProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        name: '', categoryId: '', price: '', stock: '1', description: '', status: true, imageUrl: '',
        brand: '', modelName: '', variant: '', year: '', condition: 'Xe mới', licensePlate: '',
        mileage: '0', conditionDetail: '', color: '', bodyType: '', fuelType: '', engineCapacity: '',
        maxPower: '', maxTorque: '', transmission: '', driveType: '', length: '', width: '', height: '',
        wheelbase: '', groundClearance: '', curbWeight: '', fuelTankCapacity: '', avgFuelConsumption: '',
        autoConditioning: false, infotainment: false, appleCarplay: false, electricSeats: false,
        camera360: false, airbags: '0', abs: false, esp: false, ba: false, rearSensor: false,
        colorVariants: [{ color: '', images: [] as string[] }],
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await http.get('/products/vendor/me');
            setProducts(data || []);
        } catch (error: any) { toast.error('Không thể tải danh sách sản phẩm'); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchProducts();
        http.get('/categories').then(res => setCategories(res.data)).catch(err => console.error(err));
        http.get('/brands').then(res => setBrands(res.data)).catch(err => console.error(err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (formErrors[name]) { setFormErrors(prev => { const newErrors = { ...prev }; delete newErrors[name]; return newErrors; }); }
        if (type === 'checkbox') { const checked = (e.target as HTMLInputElement).checked; setFormData(prev => ({ ...prev, [name]: checked })); }
        else { setFormData(prev => ({ ...prev, [name]: value })); }
    };

    const handleVariantFileChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        setIsLoading(true);
        try {
            const updatedVariants = [...formData.colorVariants];
            const currentVariant = { ...updatedVariants[index] };
            const newImages = [...currentVariant.images];
            for (let i = 0; i < files.length; i++) {
                const data = new FormData();
                data.append('file', files[i]);
                const res = await http.post('/users/avatar', data, { headers: { 'Content-Type': 'multipart/form-data' } });
                newImages.push(res.data.avatarUrl);
            }
            currentVariant.images = newImages;
            updatedVariants[index] = currentVariant;
            setFormData(prev => ({ ...prev, colorVariants: updatedVariants, imageUrl: prev.imageUrl || newImages[0] }));
        } catch (error) { toast.error('Không thể tải ảnh lên'); } finally { setIsLoading(false); event.target.value = ''; }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        const addError = (id: string, message: string) => { errors[id] = message; };
        const required = ['name', 'brand', 'modelName', 'price', 'year', 'bodyType', 'fuelType', 'transmission'];
        required.forEach(field => { if (!formData[field as keyof typeof formData]) addError(field, 'Trường này là bắt buộc'); });
        if (Object.keys(errors).length > 0) { setFormErrors(errors); toast.error('Vui lòng điền đủ thông tin bắt buộc'); return false; }
        return true;
    };

    const handleAdd = async () => {
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            await http.post('/products', { ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock), year: parseInt(formData.year) });
            toast.success('Thêm sản phẩm thành công');
            setIsAddOpen(false); fetchProducts();
        } catch (error) { toast.error('Có lỗi xảy ra'); } finally { setIsLoading(false); }
    };

    const handleEdit = async () => {
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            await http.patch(`/products/${selectedProduct.id}`, { ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock), year: parseInt(formData.year) });
            toast.success('Cập nhật thành công');
            setIsEditOpen(false); fetchProducts();
        } catch (error) { toast.error('Có lỗi xảy ra'); } finally { setIsLoading(false); }
    };

    const renderProductForm = () => (
        <div className="space-y-10 py-6 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-orange-600 pl-4">
                    <Car className="w-5 h-5 text-orange-600" />
                    <h3 className="text-xl font-black uppercase tracking-tight text-gray-800">1. Thông tin Nhận diện</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-gray-400">Tên xe hiển thị</Label>
                        <Input name="name" value={formData.name} onChange={handleChange} className={`rounded-xl h-12 shadow-sm ${formErrors.name ? 'border-red-500 bg-red-50' : ''}`} placeholder="VD: Toyota Camry 2.5Q 2024" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-gray-400">Hãng xe</Label>
                        <select name="brand" value={formData.brand} onChange={handleChange} className="flex h-12 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm shadow-sm">
                            <option value="">-- Chọn hãng --</option>
                            {brands.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-gray-400">Dòng xe (Model)</Label>
                        <Input name="modelName" value={formData.modelName} onChange={handleChange} className="rounded-xl h-12 shadow-sm" placeholder="VD: Camry" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-gray-400">Năm sản xuất</Label>
                        <Input name="year" type="number" value={formData.year} onChange={handleChange} className="rounded-xl h-12 shadow-sm" placeholder="2024" />
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-black uppercase tracking-tight text-gray-800">2. Thông số Kỹ thuật</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-gray-400">Kiểu dáng</Label>
                        <select name="bodyType" value={formData.bodyType} onChange={handleChange} className="flex h-12 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm shadow-sm">
                            <option value="">-- Chọn --</option>
                            <option value="Sedan">Sedan</option><option value="SUV">SUV</option><option value="Hatchback">Hatchback</option><option value="MPV">MPV</option><option value="Pickup">Pickup</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-gray-400">Nhiên liệu</Label>
                        <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="flex h-12 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm shadow-sm">
                            <option value="">-- Chọn --</option>
                            <option value="Xăng">Xăng</option><option value="Dầu">Dầu (Diesel)</option><option value="Điện">Điện</option><option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-gray-400">Hộp số</Label>
                        <select name="transmission" value={formData.transmission} onChange={handleChange} className="flex h-12 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm shadow-sm">
                            <option value="">-- Chọn --</option>
                            <option value="Số tự động">Số tự động (AT)</option><option value="Số sàn">Số sàn (MT)</option><option value="Vô cấp">Vô cấp (CVT)</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-gray-400">Giá bán (VNĐ)</Label>
                        <Input name="price" type="number" value={formData.price} onChange={handleChange} className="rounded-xl h-12 shadow-sm font-black text-blue-600 text-lg" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-gray-400">Tình trạng</Label>
                        <select name="condition" value={formData.condition} onChange={handleChange} className="flex h-12 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm shadow-sm">
                            <option value="Xe mới">Xe mới 100%</option>
                            <option value="Xe cũ">Xe đã qua sử dụng</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-emerald-600 pl-4">
                    <ImageIcon className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-xl font-black uppercase tracking-tight text-gray-800">3. Màu sắc & Hình ảnh thực tế</h3>
                </div>
                {formData.colorVariants.map((variant, vIdx) => (
                    <div key={vIdx} className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="font-black text-gray-600 uppercase text-[10px] tracking-widest">Phiên bản màu #{vIdx + 1}</Label>
                            {formData.colorVariants.length > 1 && <Button variant="ghost" size="icon" onClick={() => setFormData(p => ({ ...p, colorVariants: p.colorVariants.filter((_, i) => i !== vIdx) }))} className="text-red-500 hover:bg-red-50 rounded-full"><X className="w-4 h-4" /></Button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500">Chọn mã màu</Label>
                                <div className="flex flex-wrap gap-2">
                                    {CAR_COLORS.map(c => (
                                        <button key={c.name} onClick={() => { const nv = [...formData.colorVariants]; nv[vIdx].color = c.name; setFormData(p => ({ ...p, colorVariants: nv })); }} className={`w-8 h-8 rounded-full border-2 transition-all ${variant.color === c.name ? 'border-orange-500 scale-110 shadow-lg' : 'border-transparent opacity-60'}`} style={{ backgroundColor: c.hex }} title={c.name} />
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500">Tải ảnh thực tế (Ít nhất 1 ảnh)</Label>
                                <Input type="file" multiple onChange={(e) => handleVariantFileChange(vIdx, e)} className="rounded-xl h-11 border-none bg-white shadow-sm cursor-pointer" />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-4">
                            {variant.images.map((img, iIdx) => (
                                <div key={iIdx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 group">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button onClick={() => { const nv = [...formData.colorVariants]; nv[vIdx].images.splice(iIdx, 1); setFormData(p => ({ ...p, colorVariants: nv })); }} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-red-500" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <Button variant="outline" onClick={() => setFormData(p => ({ ...p, colorVariants: [...p.colorVariants, { color: '', images: [] }] }))} className="w-full rounded-2xl border-dashed border-2 py-8 bg-gray-50/50 hover:bg-orange-50/50 hover:border-orange-200 text-gray-400 hover:text-orange-600 font-bold transition-all"><Plus className="mr-2" /> Thêm phiên bản màu khác</Button>
            </section>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 italic">Quản lý Sản phẩm</h1>
                    <div className="h-1.5 w-24 bg-orange-600 rounded-full mt-2" />
                </div>
                <Button onClick={() => { setIsAddOpen(true); setFormData(p => ({ ...p, colorVariants: [{ color: '', images: [] }] })); }} className="rounded-[1.5rem] bg-orange-600 hover:bg-orange-700 h-14 px-8 font-black text-md uppercase gap-3 shadow-2xl shadow-orange-200 transition-all hover:-translate-y-1 active:scale-95">
                    <Plus className="w-6 h-6" /> Đăng xe mới ngay
                </Button>
            </div>

            {loading ? (
                <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-orange-600" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="group relative bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden hover:shadow-orange-200/40 transition-all duration-700">
                            <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                                <img src={product.imageUrl || '/placeholder-car.jpg'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute top-6 right-6 flex flex-col gap-2">
                                    <Badge className={`${product.status ? 'bg-emerald-500' : 'bg-gray-400'} text-white border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-lg`}>{product.status ? 'Đang mở bán' : 'Tạm ẩn'}</Badge>
                                    <Badge className="bg-white/90 backdrop-blur text-gray-900 border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-lg">{product.condition}</Badge>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-2">{product.brand} • {product.year}</div>
                                <h3 className="text-2xl font-black text-gray-900 mb-6 group-hover:text-orange-600 transition-colors line-clamp-1">{product.name}</h3>
                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <div className="font-black text-blue-600 text-2xl tracking-tighter">{product.price.toLocaleString()} <span className="text-xs uppercase opacity-40 ml-1">đ</span></div>
                                    <div className="flex gap-3">
                                        <Button size="icon" variant="outline" onClick={() => { setSelectedProduct(product); setFormData({ ...product, price: product.price.toString(), stock: product.stock.toString(), year: product.year?.toString() || '', colorVariants: product.colorVariants?.map((cv: any) => ({ color: cv.color, images: cv.images?.map((im: any) => im.url) || [] })) || [{ color: '', images: [] }] }); setIsEditOpen(true); }} className="w-12 h-12 rounded-2xl bg-gray-50 border-none hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"><Pencil className="w-5 h-5" /></Button>
                                        <Button size="icon" variant="outline" onClick={async () => { if (confirm('Xóa vĩnh viễn sản phẩm này?')) { try { await http.delete(`/products/${product.id}`); toast.success('Đã xóa'); fetchProducts(); } catch (err) { toast.error('Lỗi'); } } }} className="w-12 h-12 rounded-2xl bg-gray-50 border-none hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"><Trash2 className="w-5 h-5" /></Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-5xl rounded-[3.5rem] p-0 overflow-hidden border-none shadow-[0_0_100px_rgba(0,0,0,0.1)]">
                    <DialogHeader className="bg-orange-600 px-12 py-10 text-white flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="text-3xl font-black uppercase tracking-tighter italic">Đăng xe mới</DialogTitle>
                            <p className="text-orange-100 font-bold text-sm mt-1 uppercase tracking-widest opacity-80">Thông tin xe niêm yết</p>
                        </div>
                        <Car className="w-16 h-16 opacity-20 -rotate-12" />
                    </DialogHeader>
                    <div className="px-12 py-10 bg-white">{renderProductForm()}</div>
                    <DialogFooter className="bg-gray-50 px-12 py-8 flex items-center justify-between border-t">
                        <p className="text-xs font-bold text-gray-400 uppercase italic">Vui lòng kiểm tra kỹ trước khi đăng</p>
                        <div className="flex gap-4">
                            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-2xl font-black uppercase text-xs tracking-widest">Hủy bỏ</Button>
                            <Button onClick={handleAdd} disabled={isLoading} className="rounded-2xl bg-orange-600 hover:bg-orange-700 h-14 px-10 font-black text-white uppercase shadow-xl shadow-orange-100 transition-all">{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xuất bản ngay'}</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-5xl rounded-[3.5rem] p-0 overflow-hidden border-none shadow-[0_0_100px_rgba(0,0,0,0.1)]">
                    <DialogHeader className="bg-blue-600 px-12 py-10 text-white flex-row items-center justify-between">
                        <div><DialogTitle className="text-3xl font-black uppercase tracking-tighter italic">Cập nhật Tin đăng</DialogTitle></div>
                        <Settings className="w-16 h-16 opacity-20 animate-[spin_10s_linear_infinite]" />
                    </DialogHeader>
                    <div className="px-12 py-10 bg-white">{renderProductForm()}</div>
                    <DialogFooter className="bg-gray-50 px-12 py-8 border-t flex items-center justify-end gap-4">
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-2xl font-black uppercase text-xs">Hủy</Button>
                        <Button onClick={handleEdit} disabled={isLoading} className="rounded-2xl bg-blue-600 hover:bg-blue-700 h-14 px-10 font-black text-white uppercase shadow-xl shadow-blue-100 transition-all">Lưu thay đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
