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

const CAR_COLORS = [
    { name: 'Trắng', hex: '#FFFFFF' },
    { name: 'Đen', hex: '#000000' },
    { name: 'Bạc', hex: '#C0C0C0' },
    { name: 'Xám', hex: '#808080' },
    { name: 'Đỏ', hex: '#FF0000' },
    { name: 'Xanh dương', hex: '#0000FF' },
    { name: 'Nâu', hex: '#A52A2A' },
    { name: 'Vàng cát', hex: '#F5F5DC' },
    { name: 'Xanh lá', hex: '#008000' },
    { name: 'Vàng', hex: '#FFFF00' },
    { name: 'Cam', hex: '#FFA500' },
];

export default function ProductsTab({ products, onRefresh }: ProductsTabProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
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
        variant: '',
        year: '',
        condition: 'Xe mới',
        licensePlate: '',
        mileage: '0',
        conditionDetail: '',
        color: '',
        bodyType: '',
        // Thông số động cơ
        fuelType: '',
        engineCapacity: '',
        maxPower: '',
        maxTorque: '',
        transmission: '',
        driveType: '',
        // Thông số kích thước & trọng lượng
        length: '',
        width: '',
        height: '',
        wheelbase: '',
        groundClearance: '',
        curbWeight: '',
        // Nhiên liệu
        fuelTankCapacity: '',
        avgFuelConsumption: '',
        // Tiện nghi
        autoConditioning: false,
        infotainment: false,
        appleCarplay: false,
        electricSeats: false,
        camera360: false,
        // An toàn
        airbags: '0',
        abs: false,
        esp: false,
        ba: false,
        rearSensor: false,
        colorVariants: [{ color: '', images: [] as string[] }],
    });

    useEffect(() => {
        // Fetch categories when component mounts
        http.get('/categories').then(res => {
            setCategories(res.data);
        }).catch(err => console.error(err));
        
        // Fetch brands and models
        http.get('/brands').then(res => {
            setBrands(res.data);
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

    // Gallery functions removed

    const handleVariantFileChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsLoading(true);
        try {
            const updatedVariants = [...formData.colorVariants];
            const currentVariant = { ...updatedVariants[index] };
            const newImages = [...currentVariant.images];

            for (let i = 0; i < files.length; i++) {
                if (newImages.length >= 10) {
                    toast.error(`Màu ${currentVariant.color || (index + 1)} đã đạt giới hạn 10 ảnh!`);
                    break;
                }
                const file = files[i];
                if (!file.type.startsWith('image/')) continue;

                const data = new FormData();
                data.append('file', file);
                const res = await http.post('/users/avatar', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                newImages.push(res.data.avatarUrl);
            }

            currentVariant.images = newImages;
            updatedVariants[index] = currentVariant;
            setFormData(prev => ({ ...prev, colorVariants: updatedVariants }));
            toast.success('Đã tải ảnh lên phiên bản');
        } catch (error) {
            console.error('Lỗi tải ảnh biến thể:', error);
            toast.error('Không thể tải ảnh lên');
        } finally {
            setIsLoading(false);
            event.target.value = '';
        }
    };

    const removeVariantImage = (variantIndex: number, imageIndex: number) => {
        const updatedVariants = [...formData.colorVariants];
        const currentVariant = { ...updatedVariants[variantIndex] };
        const newImages = [...currentVariant.images];
        newImages.splice(imageIndex, 1);
        currentVariant.images = newImages;
        updatedVariants[variantIndex] = currentVariant;
        setFormData(prev => ({ ...prev, colorVariants: updatedVariants }));
    };

    const addVariant = () => {
        if (formData.colorVariants.length >= 10) {
            toast.error('Tối đa 10 phiên bản màu!');
            return;
        }
        setFormData(prev => ({
            ...prev,
            colorVariants: [...prev.colorVariants, { color: '', images: [] }]
        }));
    };

    const removeVariant = (index: number) => {
        const newVariants = formData.colorVariants.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, colorVariants: newVariants }));
    };

    const handleColorChange = (index: number, color: string) => {
        const newVariants = [...formData.colorVariants];
        newVariants[index] = { ...newVariants[index], color };
        setFormData(prev => ({ ...prev, colorVariants: newVariants }));
    };


    const handleAdd = async () => {
        setIsLoading(true);
        try {
            await http.post('/products', {
                ...formData,
                categoryId: categories.length > 0 ? categories[0].id : 1,
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                year: parseInt(formData.year) || undefined,
                licensePlate: formData.condition === 'Xe cũ' ? formData.licensePlate : null,
                mileage: formData.condition === 'Xe cũ' ? (parseFloat(formData.mileage) || 0) : null,
                conditionDetail: formData.condition === 'Xe cũ' ? formData.conditionDetail : null,
                length: parseFloat(formData.length) || undefined,
                width: parseFloat(formData.width) || undefined,
                height: parseFloat(formData.height) || undefined,
                wheelbase: parseFloat(formData.wheelbase) || undefined,
                groundClearance: parseFloat(formData.groundClearance) || undefined,
                curbWeight: parseFloat(formData.curbWeight) || undefined,
                fuelTankCapacity: parseFloat(formData.fuelTankCapacity) || undefined,
                avgFuelConsumption: parseFloat(formData.avgFuelConsumption) || undefined,
                autoConditioning: formData.autoConditioning,
                infotainment: formData.infotainment,
                appleCarplay: formData.appleCarplay,
                electricSeats: formData.electricSeats,
                camera360: formData.camera360,
                airbags: parseInt(formData.airbags) || 0,
                abs: formData.abs,
                esp: formData.esp,
                ba: formData.ba,
                rearSensor: formData.rearSensor,
                colorVariants: formData.colorVariants,
            });
            toast.success('Thêm sản phẩm thành công');
            setIsAddOpen(false);
            setFormData({
                name: '', categoryId: '', price: '', stock: '1', description: '', status: true, imageUrl: '',
                brand: '', modelName: '', variant: '', year: '', condition: 'Xe mới', licensePlate: '',
                mileage: '0', conditionDetail: '', color: '', bodyType: '', fuelType: '',
                engineCapacity: '', maxPower: '', maxTorque: '', transmission: '', driveType: '',
                length: '', width: '', height: '', wheelbase: '', groundClearance: '',
                curbWeight: '', fuelTankCapacity: '', avgFuelConsumption: '',
                autoConditioning: false, infotainment: false, appleCarplay: false, 
                electricSeats: false, camera360: false, airbags: '0', abs: false, esp: false, 
                ba: false, rearSensor: false,
                colorVariants: [{ color: '', images: [] }],
            });
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
            variant: prod.variant || '',
            year: prod.year?.toString() || '',
            condition: prod.condition || 'Xe mới',
            licensePlate: prod.licensePlate || '',
            mileage: prod.mileage?.toString() || '0',
            conditionDetail: prod.conditionDetail || '',
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
            curbWeight: prod.curbWeight?.toString() || '',
            fuelTankCapacity: prod.fuelTankCapacity?.toString() || '',
            avgFuelConsumption: prod.avgFuelConsumption?.toString() || '',
            autoConditioning: prod.autoConditioning || false,
            infotainment: prod.infotainment || false,
            appleCarplay: prod.appleCarplay || false,
            electricSeats: prod.electricSeats || false,
            camera360: prod.camera360 || false,
            airbags: prod.airbags?.toString() || '0',
            abs: prod.abs || false,
            esp: prod.esp || false,
            ba: prod.ba || false,
            rearSensor: prod.rearSensor || false,
            colorVariants: prod.colorVariants && prod.colorVariants.length > 0 
                ? prod.colorVariants.map((cv: any) => ({ 
                    color: cv.color, 
                    images: cv.images?.map((img: any) => img.url) || [] 
                }))
                : [{ color: '', images: [] }],
        });
        setIsEditOpen(true);
    };

    const handleEdit = async () => {
        setIsLoading(true);
        try {
            await http.patch(`/products/${selectedProduct.id}`, {
                ...formData,
                categoryId: formData.categoryId || (categories.length > 0 ? categories[0].id : 1),
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                year: parseInt(formData.year) || undefined,
                licensePlate: formData.condition === 'Xe cũ' ? formData.licensePlate : null,
                mileage: formData.condition === 'Xe cũ' ? (parseFloat(formData.mileage) || 0) : null,
                conditionDetail: formData.condition === 'Xe cũ' ? formData.conditionDetail : null,
                length: parseFloat(formData.length) || undefined,
                width: parseFloat(formData.width) || undefined,
                height: parseFloat(formData.height) || undefined,
                wheelbase: parseFloat(formData.wheelbase) || undefined,
                groundClearance: parseFloat(formData.groundClearance) || undefined,
                curbWeight: parseFloat(formData.curbWeight) || undefined,
                fuelTankCapacity: parseFloat(formData.fuelTankCapacity) || undefined,
                avgFuelConsumption: parseFloat(formData.avgFuelConsumption) || undefined,
                autoConditioning: formData.autoConditioning,
                infotainment: formData.infotainment,
                appleCarplay: formData.appleCarplay,
                electricSeats: formData.electricSeats,
                camera360: formData.camera360,
                airbags: parseInt(formData.airbags) || 0,
                abs: formData.abs,
                esp: formData.esp,
                ba: formData.ba,
                rearSensor: formData.rearSensor,
                colorVariants: formData.colorVariants,
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

    const renderProductForm = () => {
        const selectedBrandObj = brands.find(b => b.name === formData.brand);
        const availableModels = selectedBrandObj ? selectedBrandObj.models : [];
        const selectedModelObj = availableModels.find((m: any) => m.name === formData.modelName);
        const availableVariants = selectedModelObj ? selectedModelObj.variants || [] : [];

        return (
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
                        <Label htmlFor="brand" className="text-sm font-semibold text-gray-700">Hãng xe</Label>
                        <select 
                            id="brand" 
                            name="brand" 
                            value={formData.brand} 
                            onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value, modelName: '', variant: '' }))} 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">-- Chọn hãng xe --</option>
                            {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="modelName" className="text-sm font-semibold text-gray-700">Dòng xe</Label>
                        <select 
                            id="modelName" 
                            name="modelName" 
                            value={formData.modelName} 
                            onChange={(e) => setFormData(prev => ({ ...prev, modelName: e.target.value, variant: '' }))} 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            disabled={!formData.brand}
                        >
                            <option value="">-- Chọn dòng xe --</option>
                            {availableModels.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="year" className="text-sm font-semibold text-gray-700">Năm sản xuất</Label>
                        <Input id="year" name="year" type="number" value={formData.year} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="variant" className="text-sm font-semibold text-gray-700">Phiên bản</Label>
                        <select 
                            id="variant" 
                            name="variant" 
                            value={formData.variant} 
                            onChange={handleChange} 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            disabled={!formData.modelName}
                        >
                            <option value="">-- Chọn phiên bản --</option>
                            {availableVariants.map((v: any) => <option key={v.id} value={v.name}>{v.name}</option>)}
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
                    {formData.condition === 'Xe cũ' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="licensePlate" className="text-sm font-semibold text-gray-700">Biển số xe</Label>
                                <Input id="licensePlate" name="licensePlate" placeholder="Ví dụ: 30A-123.45" value={formData.licensePlate} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mileage" className="text-sm font-semibold text-gray-700">Số km đã đi</Label>
                                <Input id="mileage" name="mileage" type="number" value={formData.mileage} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="conditionDetail" className="text-sm font-semibold text-gray-700">Chi tiết tình trạng xe</Label>
                                <select id="conditionDetail" name="conditionDetail" value={formData.conditionDetail} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="">-- Chọn --</option>
                                    <option value="Rất tốt">Rất tốt</option>
                                    <option value="Tốt">Tốt</option>
                                    <option value="Trung bình">Trung bình</option>
                                    <option value="Cần sửa">Cần sửa</option>
                                </select>
                            </div>
                        </>
                    )}
                </div> {/* End grid */}



                {/* 1.5. Các phiên bản màu sắc & Hình ảnh */}
                <div className="space-y-6 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <Label className="text-base font-bold text-gray-800">Màu sắc & Hình ảnh thực tế</Label>
                            <p className="text-xs text-gray-400">Thêm từng màu sắc và album ảnh tương ứng.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                type="button" 
                                onClick={addVariant} 
                                variant="outline" 
                                size="sm" 
                                className="text-orange-600 border-orange-200 hover:bg-orange-50 font-bold"
                                disabled={formData.colorVariants.length >= 10}
                            >
                                <Plus className="w-4 h-4 mr-1" /> Thêm mẫu mới
                            </Button>
                        </div>
                    </div>
                    
                    <div className="space-y-8">
                        {formData.colorVariants.map((cv, variantIndex) => (
                            <div key={variantIndex} className="p-8 rounded-3xl border-2 border-gray-100 bg-white shadow-md relative group transition-all hover:border-blue-100">
                                {formData.colorVariants.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removeVariant(variantIndex)}
                                        className="absolute -top-3 -right-3 w-9 h-9 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-lg border border-red-100 hover:bg-red-500 hover:text-white transition-all z-10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                
                                <div className="space-y-8">
                                    {/* 1.5.1 Section Header: Color Selection */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-200">
                                                    {variantIndex + 1}
                                                </div>
                                                <Label className="text-base font-bold text-gray-800 tracking-tight">Mẫu số {variantIndex + 1}: {cv.color || 'Chưa chọn màu'}</Label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                            <div className="md:col-span-4 space-y-3">
                                                <Label className="text-[11px] font-bold text-gray-500 uppercase">Chọn mã màu xe</Label>
                                                <div className="flex flex-wrap gap-2.5 p-4 bg-gray-50 rounded-2xl border border-gray-100/50 shadow-inner">
                                                    {CAR_COLORS.map((c) => (
                                                        <button
                                                            key={c.name}
                                                            type="button"
                                                            onClick={() => handleColorChange(variantIndex, c.name)}
                                                            className={`w-9 h-9 rounded-full border-2 transition-all ${cv.color === c.name ? 'border-blue-600 scale-110 shadow-lg ring-4 ring-blue-50' : 'border-white hover:scale-105 shadow-sm active:scale-95'}`}
                                                            style={{ backgroundColor: c.hex }}
                                                            title={c.name}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="md:col-span-8 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-[11px] font-bold text-gray-500 uppercase">Album ảnh riêng của màu này</Label>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cv.images.length >= 10 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {cv.images.length}/10 ảnh
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                                    {cv.images.length < 10 && (
                                                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group/add hover:shadow-md">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                multiple
                                                                accept="image/*"
                                                                onChange={(e) => handleVariantFileChange(variantIndex, e)}
                                                            />
                                                            <Plus className="w-6 h-6 text-gray-300 group-hover/add:text-blue-500 transition-colors" />
                                                            <span className="text-[9px] font-black text-gray-400 group-hover/add:text-blue-600 uppercase mt-1 tracking-tighter">Thêm ảnh</span>
                                                        </label>
                                                    )}

                                                    {cv.images.map((url, imageIndex) => (
                                                        <div key={imageIndex} className="relative aspect-square rounded-xl border-2 border-gray-100 overflow-hidden group/thumb shadow-sm">
                                                            <img src={url} alt={`Variant ${variantIndex} Img ${imageIndex}`} className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeVariantImage(variantIndex, imageIndex)}
                                                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-all shadow-lg scale-90 hover:scale-100"
                                                            >
                                                                 <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-6">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Mô tả chi tiết sản phẩm</Label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả các đặc điểm nổi bật, lịch sử bảo dưỡng..." className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none" />
                </div>
            </div> {/* End 1. Thông tin cơ bản section */}


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

            {/* 3. Thông số kích thước & trọng lượng */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-green-600 border-l-4 border-green-600 pl-3">3. Kích thước & trọng lượng</h3>
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
                    <div className="space-y-2">
                        <Label htmlFor="curbWeight" className="text-sm font-semibold text-gray-700">Trọng lượng không tải (kg)</Label>
                        <Input id="curbWeight" name="curbWeight" type="number" value={formData.curbWeight} onChange={handleChange} />
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

            {/* 5. Tiện nghi */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-purple-600 border-l-4 border-purple-600 pl-3">5. Tiện nghi</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="autoConditioning" name="autoConditioning" checked={formData.autoConditioning} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-purple-600" />
                        <label htmlFor="autoConditioning" className="text-sm text-gray-700 font-medium">Điều hòa tự động</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="infotainment" name="infotainment" checked={formData.infotainment} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-purple-600" />
                        <label htmlFor="infotainment" className="text-sm text-gray-700 font-medium">Màn hình giải trí</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="appleCarplay" name="appleCarplay" checked={formData.appleCarplay} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-purple-600" />
                        <label htmlFor="appleCarplay" className="text-sm text-gray-700 font-medium">Apple CarPlay/Android Auto</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="electricSeats" name="electricSeats" checked={formData.electricSeats} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-purple-600" />
                        <label htmlFor="electricSeats" className="text-sm text-gray-700 font-medium">Ghế chỉnh điện</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="camera360" name="camera360" checked={formData.camera360} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-purple-600" />
                        <label htmlFor="camera360" className="text-sm text-gray-700 font-medium">Camera lùi/360</label>
                    </div>
                </div>
            </div>

            {/* 6. An toàn */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-red-600 border-l-4 border-red-600 pl-3">6. An toàn</h3>
                <div className="space-y-4">
                    <div className="w-full md:w-1/2 space-y-2">
                        <Label htmlFor="airbags" className="text-sm font-semibold text-gray-700">Túi khí (số lượng)</Label>
                        <Input id="airbags" name="airbags" type="number" min="0" value={formData.airbags} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="abs" name="abs" checked={formData.abs} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-red-600" />
                            <label htmlFor="abs" className="text-sm text-gray-700 font-medium">ABS</label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="esp" name="esp" checked={formData.esp} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-red-600" />
                            <label htmlFor="esp" className="text-sm text-gray-700 font-medium">Cân bằng điện tử (ESP)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="ba" name="ba" checked={formData.ba} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-red-600" />
                            <label htmlFor="ba" className="text-sm text-gray-700 font-medium">Hỗ trợ phanh (BA)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="rearSensor" name="rearSensor" checked={formData.rearSensor} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-red-600" />
                            <label htmlFor="rearSensor" className="text-sm text-gray-700 font-medium">Cảm biến lùi</label>
                        </div>
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
    };

    return (
        <div>
                 <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Quản lý sản phẩm</h2>
                <Button onClick={() => setIsAddOpen(true)} className="bg-[#E65E2C] hover:bg-[#d95222] text-white">Thêm sản phẩm mới</Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID</th>
                            <th scope="col" className="px-6 py-3">Xe</th>
                            <th scope="col" className="px-6 py-3">Hãng & Dòng xe</th>
                            <th scope="col" className="px-6 py-3">Giá bán</th>
                            <th scope="col" className="px-6 py-3">Số lượng</th>
                            <th scope="col" className="px-6 py-3">Trạng thái</th>
                            <th scope="col" className="px-6 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 && (
                            <tr><td colSpan={8} className="px-6 py-4 text-center text-gray-500">Chưa có sản phẩm nào.</td></tr>
                        )}
                        {products.map((prod) => (
                            <tr key={prod.id} className="bg-white border-b hover:bg-orange-50/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-400">#{prod.id}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={prod.imageUrl || 'https://via.placeholder.com/150'} alt={prod.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100 shadow-sm" />
                                        <div>
                                            <p className="font-bold text-gray-900 leading-tight">{prod.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{prod.year || '----'} • {prod.condition || 'Mới'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-700">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{prod.brand || '---'} {prod.modelName || ''}</span>
                                        <span className="text-xs text-gray-500">{prod.variant || '---'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-orange-600">{prod.price?.toLocaleString('vi-VN')}₫</td>
                                <td className="px-6 py-4 text-center">{prod.stock}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${prod.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {prod.status ? 'Đang bán' : 'Tạm ngưng'}
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
                    <div className="px-6 max-h-[70vh] overflow-y-auto">
                        {renderProductForm()}
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
                    <div className="px-6 max-h-[70vh] overflow-y-auto">
                        {renderProductForm()}
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
