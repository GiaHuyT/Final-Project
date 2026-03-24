"use client";

import React, { useEffect, useState } from 'react';
import {
    Search,
    Plus,
    MoreHorizontal,
    Filter,
    Package,
    Tag,
    Store,
    Eye,
    Loader2,
    Pencil,
    Trash2,
    Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import http from '@/lib/http';
import { toast } from 'react-hot-toast';

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    status: boolean;
    categoryId: number;
    category: { id: number, name: string };
    vendorId: number;
    vendor: { id: number, username: string, email: string };
    createdAt: string;
    imageUrl?: string;
    brand?: string;
    modelName?: string;
    variant?: string;
    year?: number;
    condition?: string;
    licensePlate?: string;
    mileage?: number;
    conditionDetail?: string;
    color?: string;
    bodyType?: string;
    fuelType?: string;
    engineCapacity?: string;
    maxPower?: string;
    maxTorque?: string;
    transmission?: string;
    driveType?: string;
    length?: number;
    width?: number;
    height?: number;
    wheelbase?: number;
    groundClearance?: number;
    curbWeight?: number;
    fuelTankCapacity?: number;
    avgFuelConsumption?: number;
    autoConditioning?: boolean;
    infotainment?: boolean;
    appleCarplay?: boolean;
    electricSeats?: boolean;
    camera360?: boolean;
    airbags?: number;
    abs?: boolean;
    esp?: boolean;
    ba?: boolean;
    rearSensor?: boolean;
    colorVariants?: any[];
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

export default function ProductManagementPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        vendorId: '',
        name: '',
        categoryId: '',
        price: '',
        stock: '1',
        description: '',
        status: true,
        imageUrl: '',
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
        fuelType: '',
        engineCapacity: '',
        maxPower: '',
        maxTorque: '',
        transmission: '',
        driveType: '',
        length: '',
        width: '',
        height: '',
        wheelbase: '',
        groundClearance: '',
        curbWeight: '',
        fuelTankCapacity: '',
        avgFuelConsumption: '',
        autoConditioning: false,
        infotainment: false,
        appleCarplay: false,
        electricSeats: false,
        camera360: false,
        airbags: '0',
        abs: false,
        esp: false,
        ba: false,
        rearSensor: false,
        colorVariants: [{ color: '', images: [] as string[] }],
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await http.get('/products');
            setProducts(response.data);
        } catch (error) {
            toast.error("Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        
        // Fetch categories
        http.get('/categories').then(res => {
            setCategories(res.data);
            if (res.data.length > 0 && !formData.categoryId) {
                setFormData(prev => ({ ...prev, categoryId: res.data[0].id.toString() }));
            }
        }).catch(err => console.error(err));
        
        // Fetch brands and models
        http.get('/brands').then(res => {
            setBrands(res.data);
        }).catch(err => console.error(err));

        // Lấy danh sách nhà cung cấp
        http.get('/users').then(res => {
            const vendorList = res.data.filter((u: any) => u.role === 'VENDOR');
            setVendors(vendorList);
        }).catch(err => console.error(err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleToggleStatus = async (productId: number, currentStatus: boolean) => {
        try {
            await http.patch(`/products/${productId}/status`, { status: !currentStatus });
            toast.success("Cập nhật trạng thái thành công");
            fetchProducts();
        } catch (error) {
            toast.error("Cập nhật trạng thái thất bại");
        }
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
        setFormData(prev => ({
            ...prev,
            colorVariants: [...prev.colorVariants, { color: '', images: [] }]
        }));
    };

    const removeVariant = (index: number) => {
        const newVariants = formData.colorVariants.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, colorVariants: newVariants }));
    };

    const scrollToElement = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
        }
    };

    const renderError = (field: string) => {
        if (formErrors[field]) {
            return (
                <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {formErrors[field]}
                </p>
            );
        }
        return null;
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        let firstErrorId: string | null = null;

        const addError = (id: string, message: string) => {
            errors[id] = message;
            if (!firstErrorId) firstErrorId = id;
        };

        if (!formData.vendorId) addError('vendorId', 'Vui lòng chọn nhà cung cấp');

        const fieldLabels: Record<string, string> = {
            name: 'Tên xe hiển thị',
            brand: 'Hãng xe',
            modelName: 'Dòng xe',
            variant: 'Phiên bản',
            year: 'Năm sản xuất',
            price: 'Giá bán',
            stock: 'Số lượng hàng',
            bodyType: 'Kiểu dáng',
            fuelType: 'Loại nhiên liệu',
            engineCapacity: 'Dung tích động cơ',
            maxPower: 'Công suất tối đa',
            maxTorque: 'Mô men xoắn cực đại',
            transmission: 'Hộp số',
            driveType: 'Dẫn động',
            description: 'Mô tả chi tiết',
            length: 'Chiều dài',
            width: 'Chiều rộng',
            height: 'Chiều cao',
            wheelbase: 'Chiều dài cơ sở',
            groundClearance: 'Khoảng sáng gầm xe',
            curbWeight: 'Trọng lượng không tải',
            fuelTankCapacity: 'Dung tích bình nhiên liệu',
            avgFuelConsumption: 'Tiêu hao nhiên liệu TB',
            airbags: 'Số túi khí'
        };

        const requiredFields: (keyof typeof formData)[] = Object.keys(fieldLabels) as (keyof typeof formData)[];
        for (const field of requiredFields) {
            const value = formData[field];
            if (value === undefined || value === null || value === '' || value === '-') {
                addError(field, `Không được để trống ${fieldLabels[field]}`);
            }
        }

        if (formData.condition === 'Xe cũ') {
            if (!formData.licensePlate || formData.licensePlate === '-') addError('licensePlate', 'Cần nhập biển số cho xe cũ');
            if (!formData.conditionDetail || formData.conditionDetail === '-') addError('conditionDetail', 'Cần chọn tình trạng chi tiết');
        }

        if (formData.colorVariants.length === 0) {
            toast.error('Vui lòng thêm ít nhất một mẫu màu xe');
            return false;
        }

        const selectedColors = new Set<string>();
        for (let i = 0; i < formData.colorVariants.length; i++) {
            const cv = formData.colorVariants[i];
            if (!cv.color || cv.color === '-') addError(`variant-color-${i}`, 'Vui lòng chọn mã màu cho mẫu này');
            else if (selectedColors.has(cv.color)) addError(`variant-color-${i}`, `Màu "${cv.color}" đã bị trùng lặp`);
            else selectedColors.add(cv.color);

            if (cv.images.length === 0) addError(`variant-images-${i}`, 'Cần tải lên ít nhất 1 hình ảnh thực tế');
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast.error(`Phát hiện ${Object.keys(errors).length} lỗi thông tin.`);
            if (firstErrorId) scrollToElement(firstErrorId);
            return false;
        }

        setFormErrors({});
        return true;
    };

    const handleColorChange = (index: number, color: string) => {
        const newVariants = [...formData.colorVariants];
        const finalColor = newVariants[index].color === color ? '' : color;
        newVariants[index] = { ...newVariants[index], color: finalColor };
        setFormData(prev => ({ ...prev, colorVariants: newVariants }));
        const errorKey = `variant-color-${index}`;
        if (formErrors[errorKey]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    };

    const handleAdd = async () => {
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            await http.post('/products', {
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
            toast.success('Thêm sản phẩm cho vendor thành công');
            setIsAddOpen(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            vendorId: '', name: '', categoryId: categories[0]?.id?.toString() || '', price: '', stock: '1', description: '', status: true, imageUrl: '',
            brand: '', modelName: '', variant: '', year: '', condition: 'Xe mới', licensePlate: '', mileage: '0', conditionDetail: '', color: '', bodyType: '',
            fuelType: '', engineCapacity: '', maxPower: '', maxTorque: '', transmission: '', driveType: '', length: '', width: '', height: '', wheelbase: '',
            groundClearance: '', curbWeight: '', fuelTankCapacity: '', avgFuelConsumption: '', autoConditioning: false, infotainment: false, appleCarplay: false,
            electricSeats: false, camera360: false, airbags: '0', abs: false, esp: false, ba: false, rearSensor: false,
            colorVariants: [{ color: '', images: [] }],
        });
        setFormErrors({});
    };

    const openEdit = (prod: any) => {
        setSelectedProduct(prod);
        setFormData({
            vendorId: prod.vendorId.toString(),
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
        if (!validateForm()) return;
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
            fetchProducts();
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
            fetchProducts();
        } catch (error) {
            toast.error('Không thể xóa sản phẩm.');
        }
    };

    const renderProductForm = () => {
        const selectedBrandObj = brands.find(b => b.name === formData.brand);
        const availableModels = selectedBrandObj ? selectedBrandObj.models : [];
        const selectedModelObj = availableModels.find((m: any) => m.name === formData.modelName);
        const availableVariants = selectedModelObj ? selectedModelObj.variants || [] : [];

        return (
            <div className="space-y-8 py-6">
                {/* 0. Chọn nhà cung cấp */}
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                    <Label htmlFor="vendorId" className="text-sm font-bold text-blue-700 uppercase tracking-tighter">Chọn Nhà Cung Cấp (Vendor)</Label>
                    <select 
                        id="vendorId" 
                        name="vendorId" 
                        value={formData.vendorId} 
                        onChange={handleChange} 
                        className={`flex h-12 w-full rounded-xl border-2 bg-white px-4 py-2 text-sm font-semibold transition-all focus:ring-4 focus:ring-blue-100 outline-none ${formErrors.vendorId ? 'border-red-500' : 'border-blue-200 hover:border-blue-400'}`}
                    >
                        <option value="">-- Chọn nhà cung cấp sở hữu xe này --</option>
                        {vendors.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.username} ({v.email || v.phonenumber})
                            </option>
                        ))}
                    </select>
                    {renderError('vendorId')}
                </div>

                {/* 1. Thông tin cơ bản */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-orange-600 border-l-4 border-orange-600 pl-3">1. Thông tin cơ bản</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Tên xe hiển thị</Label>
                            <Input id="name" name="name" placeholder="Ví dụ: Porsche 911 GT3 RS 2024" value={formData.name} onChange={handleChange} className={formErrors.name ? 'border-red-500 bg-red-50/30' : ''} />
                            {renderError('name')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brand" className="text-sm font-semibold text-gray-700">Hãng xe</Label>
                            <select id="brand" name="brand" value={formData.brand} onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value, modelName: '', variant: '' }))} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${formErrors.brand ? 'border-red-500 bg-red-50/30' : ''}`}>
                                <option value="">-- Chọn hãng xe --</option>
                                <option value="-">-</option>
                                {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                            </select>
                            {renderError('brand')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="modelName" className="text-sm font-semibold text-gray-700">Dòng xe</Label>
                            <select id="modelName" name="modelName" value={formData.modelName} onChange={(e) => setFormData(prev => ({ ...prev, modelName: e.target.value, variant: '' }))} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${formErrors.modelName ? 'border-red-500 bg-red-50/30' : ''}`} disabled={!formData.brand}>
                                <option value="">-- Chọn dòng xe --</option>
                                <option value="-">-</option>
                                {availableModels.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                            </select>
                            {renderError('modelName')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year" className="text-sm font-semibold text-gray-700">Năm sản xuất</Label>
                            <Input id="year" name="year" type="number" value={formData.year} onChange={handleChange} className={formErrors.year ? 'border-red-500 bg-red-50/30' : ''} />
                            {renderError('year')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="variant" className="text-sm font-semibold text-gray-700">Phiên bản</Label>
                            <select id="variant" name="variant" value={formData.variant} onChange={handleChange} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${formErrors.variant ? 'border-red-500 bg-red-50/30' : ''}`} disabled={!formData.modelName}>
                                <option value="">-- Chọn phiên bản --</option>
                                <option value="-">-</option>
                                {availableVariants.map((v: any) => <option key={v.id} value={v.name}>{v.name}</option>)}
                            </select>
                            {renderError('variant')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-sm font-semibold text-gray-700">Giá bán (VNĐ)</Label>
                            <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className={formErrors.price ? 'border-red-500 bg-red-50/30' : ''} />
                            {renderError('price')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock" className="text-sm font-semibold text-gray-700">Số lượng hàng</Label>
                            <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} className={formErrors.stock ? 'border-red-500 bg-red-50/30' : ''} />
                            {renderError('stock')}
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
                                    <Input id="licensePlate" name="licensePlate" value={formData.licensePlate} onChange={handleChange} className={formErrors.licensePlate ? 'border-red-500 bg-red-50/30' : ''} />
                                    {renderError('licensePlate')}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mileage" className="text-sm font-semibold text-gray-700">Số km đã đi</Label>
                                    <Input id="mileage" name="mileage" type="number" value={formData.mileage} onChange={handleChange} className={formErrors.mileage ? 'border-red-500 bg-red-50/30' : ''} />
                                    {renderError('mileage')}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="conditionDetail" className="text-sm font-semibold text-gray-700">Tình trạng chi tiết</Label>
                                    <select id="conditionDetail" name="conditionDetail" value={formData.conditionDetail} onChange={handleChange} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${formErrors.conditionDetail ? 'border-red-500 bg-red-50/30' : ''}`}>
                                        <option value="">-- Chọn tình trạng --</option>
                                        <option value="-">-</option>
                                        <option value="Rất mới (Like New)">Rất mới (Like New)</option>
                                        <option value="Đã qua sử dụng">Đã qua sử dụng</option>
                                        <option value="Cần sửa chữa">Cần sửa chữa</option>
                                    </select>
                                    {renderError('conditionDetail')}
                                </div>
                            </>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="bodyType" className="text-sm font-semibold text-gray-700">Kiểu dáng (Body Type)</Label>
                            <select id="bodyType" name="bodyType" value={formData.bodyType} onChange={handleChange} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${formErrors.bodyType ? 'border-red-500 bg-red-50/30' : ''}`}>
                                <option value="">-- Chọn kiểu dáng --</option>
                                <option value="-">-</option>
                                <option value="Sedan">Sedan</option>
                                <option value="SUV">SUV</option>
                                <option value="Hatchback">Hatchback</option>
                                <option value="MPV">MPV</option>
                                <option value="Pickup">Bán tải (Pickup)</option>
                                <option value="Coupe">Coupe</option>
                                <option value="Convertible">Convertible</option>
                            </select>
                            {renderError('bodyType')}
                        </div>
                    </div>

                    {/* 1.5 Variants */}
                    <div className="space-y-6 pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-bold text-gray-800">Màu sắc & Hình ảnh thực tế</Label>
                        </div>
                        <div className="space-y-8">
                            {formData.colorVariants.map((cv, variantIndex) => (
                                <div key={variantIndex} id={`variant-section-${variantIndex}`} className="relative p-6 rounded-3xl border border-gray-100 bg-white shadow-sm transition-all group overflow-visible">
                                    {formData.colorVariants.length > 1 && (
                                        <button type="button" onClick={() => removeVariant(variantIndex)} className="absolute -top-3 -right-3 w-9 h-9 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-lg border border-red-100 hover:bg-red-500 hover:text-white transition-all z-10">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase tracking-tighter">
                                                {variantIndex + 1}
                                            </div>
                                            <Label className="text-base font-bold text-gray-800 tracking-tight">Mẫu số {variantIndex + 1}: {cv.color || 'Chưa chọn màu'}</Label>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                            <div className="md:col-span-4 space-y-3">
                                                <Label className="text-[11px] font-bold text-gray-500 uppercase">Chọn mã màu xe</Label>
                                                <div className={`flex flex-wrap gap-2.5 p-4 bg-gray-50 rounded-2xl border ${formErrors[`variant-color-${variantIndex}`] ? 'border-red-500 bg-red-50/50' : 'border-gray-100/50'}`}>
                                                    {CAR_COLORS.map((c) => (
                                                        <button key={c.name} type="button" onClick={() => handleColorChange(variantIndex, c.name)} className={`w-9 h-9 rounded-full border-2 transition-all ${cv.color === c.name ? 'border-blue-600 scale-110 shadow-lg ring-4 ring-blue-50' : 'border-white hover:scale-105'}`} style={{ backgroundColor: c.hex }} title={c.name} />
                                                    ))}
                                                </div>
                                                {renderError(`variant-color-${variantIndex}`)}
                                            </div>
                                            <div className="md:col-span-8 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-[11px] font-bold text-gray-500 uppercase">Album ảnh riêng của màu này</Label>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{cv.images.length} ảnh</span>
                                                </div>
                                                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-3 rounded-2xl border ${formErrors[`variant-images-${variantIndex}`] ? 'border-red-500 bg-red-50/50' : 'border-transparent'}`}>
                                                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                                                        <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleVariantFileChange(variantIndex, e)} />
                                                        <Plus className="w-6 h-6 text-gray-300" />
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">Thêm ảnh</span>
                                                    </label>
                                                    {cv.images.map((url: string, imgIdx: number) => (
                                                        <div key={imgIdx} className="relative aspect-square rounded-xl border-2 border-gray-100 overflow-hidden group/thumb shadow-sm">
                                                            <img src={url} alt={`V${variantIndex}I${imgIdx}`} className="w-full h-full object-cover" />
                                                            <button type="button" onClick={() => removeVariantImage(variantIndex, imgIdx)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-all shadow-lg scale-90 hover:scale-100">
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                {renderError(`variant-images-${variantIndex}`)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div onClick={addVariant} className="group cursor-pointer relative overflow-hidden rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/30 p-3 transition-all hover:bg-orange-50 hover:border-orange-400 flex items-center justify-center gap-3">
                                <Plus className="h-5 w-5 text-[#E65E2C]" />
                                <h4 className="text-sm font-bold text-gray-800">Thêm mẫu xe mới ({formData.colorVariants.length})</h4>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-6">
                        <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Mô tả chi tiết sản phẩm</Label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả các đặc điểm nổi bật..." className={`flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none ${formErrors.description ? 'border-red-500 bg-red-50/30' : ''}`} />
                        {renderError('description')}
                    </div>
                </div>

                {/* 2-6 Sections grouped for simplicity */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-blue-600 border-l-4 border-blue-600 pl-3 uppercase tracking-tighter">Thông số kỹ thuật khác</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                        {/* 2. Động cơ */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-500 uppercase">2. Động cơ</h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="fuelType" className="text-xs font-bold text-gray-600">Loại nhiên liệu</Label>
                                    <select id="fuelType" name="fuelType" value={formData.fuelType} onChange={handleChange} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${formErrors.fuelType ? 'border-red-500 bg-red-50/30' : ''}`}>
                                        <option value="">-- Chọn --</option>
                                        <option value="-">-</option>
                                        <option value="Xăng">Xăng</option>
                                        <option value="Dầu (Diesel)">Dầu (Diesel)</option>
                                        <option value="Điện">Điện</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                    {renderError('fuelType')}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="transmission" className="text-xs font-bold text-gray-600">Hộp số</Label>
                                    <select id="transmission" name="transmission" value={formData.transmission} onChange={handleChange} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${formErrors.transmission ? 'border-red-500' : ''}`}>
                                        <option value="">-- Chọn --</option>
                                        <option value="-">-</option>
                                        <option value="Số sàn (MT)">Số sàn (MT)</option>
                                        <option value="Số tự động (AT)">Số tự động (AT)</option>
                                        <option value="Vô cấp (CVT)">Vô cấp (CVT)</option>
                                        <option value="Ly hợp kép (DCT)">Ly hợp kép (DCT)</option>
                                    </select>
                                    {renderError('transmission')}
                                </div>
                            </div>
                        </div>

                        {/* 3. Kích thước */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-500 uppercase">3. Kích thước</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="length" className="text-xs font-bold text-gray-600">Dài (mm)</Label>
                                    <Input id="length" name="length" type="number" value={formData.length} onChange={handleChange} className={formErrors.length ? 'border-red-500' : ''} />
                                    {renderError('length')}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="width" className="text-xs font-bold text-gray-600">Rộng (mm)</Label>
                                    <Input id="width" name="width" type="number" value={formData.width} onChange={handleChange} className={formErrors.width ? 'border-red-500' : ''} />
                                    {renderError('width')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <input type="checkbox" id="status" name="status" checked={formData.status} onChange={handleChange} className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                        <div>
                            <label htmlFor="status" className="text-sm font-bold text-gray-800">Hiển thị sản phẩm công khai</label>
                            <p className="text-[11px] text-gray-500 text-blue-600 font-bold">Người mua sẽ thấy sản phẩm này trên trang chủ và sàn đấu giá.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý sản phẩm hệ thống</h1>
                    <p className="text-muted-foreground">Admin có thể quản lý, chỉnh sửa và gán sản phẩm cho các nhà cung cấp.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                        <Filter className="h-4 w-4" />
                        Bộ lọc nâng cao
                    </Button>
                    <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-200">
                        <Plus className="h-4 w-4" />
                        Thêm sản phẩm cho Vendor
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-gray-200/50">
                <CardHeader className="border-b bg-gray-50/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Danh sách tất cả sản phẩm</CardTitle>
                            <CardDescription>Tổng cộng {products.length} sản phẩm từ tất cả nhà cung cấp.</CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Tìm theo tên xe, thương hiệu..."
                                className="pl-10 h-10 rounded-xl bg-white focus:ring-4 focus:ring-orange-100 border-gray-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100/80 text-gray-600 text-xs uppercase font-black tracking-wider border-b">
                                    <tr>
                                        <th className="px-6 py-4">Thông tin xe</th>
                                        <th className="px-6 py-4 text-center">Danh mục</th>
                                        <th className="px-6 py-4">Nhà cung cấp</th>
                                        <th className="px-6 py-4">Giá bán</th>
                                        <th className="px-6 py-4 text-center">Trạng thái</th>
                                        <th className="px-6 py-4 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-10 text-center text-gray-400 italic font-medium">
                                                Không tìm thấy sản phẩm nào khớp với từ khóa tìm kiếm.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <tr key={product.id} className="border-b hover:bg-orange-50/20 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                                                            {product.imageUrl ? (
                                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package className="h-6 w-6 text-gray-300" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{product.name}</div>
                                                            <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{product.brand} {product.modelName} • {product.year}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant="outline" className="rounded-full bg-white text-gray-600 border-gray-200">
                                                        {product.category?.name}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 font-semibold text-blue-700">
                                                            <Store className="h-3 w-3" />
                                                            {product.vendor?.username}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400">{product.vendor?.email}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-black text-orange-600">
                                                        {product.price.toLocaleString()} <span className="text-[10px] ml-0.5">₫</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">Kho: {product.stock} xe</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge
                                                        onClick={() => handleToggleStatus(product.id, product.status)}
                                                        className={`cursor-pointer rounded-full uppercase text-[10px] font-black px-3 py-1 transition-all hover:scale-105 ${
                                                            product.status 
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        {product.status ? 'Đang bán' : 'Bị ẩn'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="outline" size="icon" onClick={() => openEdit(product)} className="h-8 w-8 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" onClick={() => handleDelete(product.id)} className="h-8 w-8 rounded-full border-red-200 text-red-600 hover:bg-red-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal Thêm Sản Phẩm */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[850px] p-0 border-none shadow-2xl overflow-hidden rounded-3xl">
                    <div className="bg-orange-600 px-8 py-5 flex items-center justify-between">
                        <DialogTitle className="text-white text-xl font-black flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Plus className="w-5 h-5 text-white" />
                            </div>
                            THÊM XE MỚI CHO VENDOR
                        </DialogTitle>
                    </div>
                    <div className="px-8 max-h-[75vh] overflow-y-auto bg-white custom-scrollbar">
                        {renderProductForm()}
                    </div>
                    <DialogFooter className="px-8 py-5 bg-gray-50/80 border-t flex justify-between items-center">
                        <div className="text-xs text-gray-400 font-medium italic">Vui lòng kiểm tra kỹ tất cả thông tin trước khi đăng.</div>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors">Đóng</Button>
                            <Button onClick={handleAdd} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 text-white font-black px-10 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 uppercase tracking-tighter">
                                {isLoading ? "Đang lưu..." : "Đăng lên hệ thống"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Chỉnh Sửa Sản Phẩm */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[850px] p-0 border-none shadow-2xl overflow-hidden rounded-3xl">
                    <div className="bg-blue-600 px-8 py-5 flex items-center justify-between">
                        <DialogTitle className="text-white text-xl font-black flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Pencil className="w-5 h-5 text-white" />
                            </div>
                            CẬP NHẬT THÔNG TIN XE
                        </DialogTitle>
                    </div>
                    <div className="px-8 max-h-[75vh] overflow-y-auto bg-white custom-scrollbar">
                        {renderProductForm()}
                    </div>
                    <DialogFooter className="px-8 py-5 bg-gray-50/80 border-t flex justify-between items-center">
                        <div className="text-xs text-gray-400 font-medium italic">Lần cập nhật cuối: {selectedProduct && new Date(selectedProduct.createdAt).toLocaleDateString('vi-VN')}</div>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors">Hủy</Button>
                            <Button onClick={handleEdit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 uppercase tracking-tighter">
                                {isLoading ? "Đang xử lý..." : "Lưu thay đổi ngay"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
