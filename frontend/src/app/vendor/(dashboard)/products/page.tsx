"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { Pencil, Trash2, Image as ImageIcon, Plus, Loader2, X, Car, Settings, ShieldCheck, Zap, Info, Gauge, Fuel, Ruler, Activity, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
        name: '',
        categoryId: '',
        price: '',
        stock: '1',
        description: '',
        status: true,
        imageUrl: '',
        // Essential Info
        brand: '',
        modelName: '',
        variant: '',
        year: '',
        condition: 'Xe mới',
        licensePlate: '',
        mileage: '',
        conditionDetail: '',
        usageTime: '',
        maintenanceHistory: '',
        
        wearAndTear: '',
        vehicleHistory: '',
        remainingWarranty: '',
        color: '',
        bodyType: '',
        // Engine Stats
        fuelType: '',
        engineCapacity: '',
        maxPower: '',
        maxTorque: '',
        transmission: '',
        driveType: '',
        // Dimensions & Weight
        length: '',
        width: '',
        height: '',
        wheelbase: '',
        groundClearance: '',
        curbWeight: '',
        // Fuel & Efficiency
        fuelTankCapacity: '',
        avgFuelConsumption: '',
        // Amenities (Booleans)
        autoConditioning: false,
        infotainment: false,
        appleCarplay: false,
        electricSeats: false,
        camera360: false,
        smartKey: false,
        rearAirCon: false,
        wirelessCharger: false,
        cruiseControl: false,
        hud: false,
        heatedSeats: false,
        sunroof: false,
        premiumAudio: false,
        // Safety
        airbags: '0',
        abs: false,
        ebd: false,
        ba: false,
        esp: false,
        tcs: false,
        hsa: false,
        aeb: false,
        lka: false,
        bsm: false,
        acc: false,
        rearSensor: false,
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
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
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
                const data = new FormData();
                data.append('file', files[i]);
                const res = await http.post('/users/avatar', data, { headers: { 'Content-Type': 'multipart/form-data' } });
                newImages.push(res.data.avatarUrl);
            }
            currentVariant.images = newImages;
            updatedVariants[index] = currentVariant;
            setFormData(prev => ({
                ...prev,
                colorVariants: updatedVariants,
                imageUrl: prev.imageUrl || newImages[0]
            }));
            toast.success('Đã tải ảnh lên');
        } catch (error) { toast.error('Không thể tải ảnh lên'); } finally { setIsLoading(false); event.target.value = ''; }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        const required = ['name', 'brand', 'modelName', 'price', 'year', 'bodyType', 'fuelType', 'transmission'];
        required.forEach(field => { if (!formData[field as keyof typeof formData]) errors[field] = 'Trường này là bắt buộc'; });
        if (Object.keys(errors).length > 0) { setFormErrors(errors); toast.error('Vui lòng điền đủ thông tin bắt buộc'); return false; }
        return true;
    };

    const handleAdd = async () => {
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                categoryId: categories.length > 0 ? categories[0].id : 1,
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                year: parseInt(formData.year) || undefined,
                licensePlate: formData.condition === 'Xe lướt' ? formData.licensePlate : null,
                mileage: formData.condition === 'Xe lướt' ? (parseFloat(formData.mileage) || 0) : null,
                conditionDetail: formData.condition === 'Xe lướt' ? formData.conditionDetail : null,
                usageTime: formData.condition === 'Xe lướt' ? formData.usageTime : null,
                
                wearAndTear: formData.condition === 'Xe lướt' ? formData.wearAndTear : null,
                vehicleHistory: formData.condition === 'Xe lướt' ? formData.vehicleHistory : null,
                remainingWarranty: formData.condition === 'Xe lướt' ? formData.remainingWarranty : null,
                length: parseFloat(formData.length) || undefined,
                width: parseFloat(formData.width) || undefined,
                height: parseFloat(formData.height) || undefined,
                wheelbase: parseFloat(formData.wheelbase) || undefined,
                groundClearance: parseFloat(formData.groundClearance) || undefined,
                curbWeight: parseFloat(formData.curbWeight) || undefined,
                fuelTankCapacity: parseFloat(formData.fuelTankCapacity) || undefined,
                avgFuelConsumption: parseFloat(formData.avgFuelConsumption) || undefined,
                airbags: parseInt(formData.airbags) || 0,
            };
            await http.post('/products', payload);
            toast.success('Thêm sản phẩm thành công');
            setIsAddOpen(false); fetchProducts();
        } catch (error: any) { toast.error(error.response?.data?.message || 'Có lỗi xảy ra'); } finally { setIsLoading(false); }
    };

    const handleEdit = async () => {
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                categoryId: formData.categoryId || (categories.length > 0 ? categories[0].id : 1),
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                year: parseInt(formData.year) || undefined,
                licensePlate: formData.condition === 'Xe lướt' ? formData.licensePlate : null,
                mileage: formData.condition === 'Xe lướt' ? (parseFloat(formData.mileage) || 0) : null,
                conditionDetail: formData.condition === 'Xe lướt' ? formData.conditionDetail : null,
                usageTime: formData.condition === 'Xe lướt' ? formData.usageTime : null,
                
                wearAndTear: formData.condition === 'Xe lướt' ? formData.wearAndTear : null,
                vehicleHistory: formData.condition === 'Xe lướt' ? formData.vehicleHistory : null,
                remainingWarranty: formData.condition === 'Xe lướt' ? formData.remainingWarranty : null,
                length: parseFloat(formData.length) || undefined,
                width: parseFloat(formData.width) || undefined,
                height: parseFloat(formData.height) || undefined,
                wheelbase: parseFloat(formData.wheelbase) || undefined,
                groundClearance: parseFloat(formData.groundClearance) || undefined,
                curbWeight: parseFloat(formData.curbWeight) || undefined,
                fuelTankCapacity: parseFloat(formData.fuelTankCapacity) || undefined,
                avgFuelConsumption: parseFloat(formData.avgFuelConsumption) || undefined,
                airbags: parseInt(formData.airbags) || 0,
            };
            await http.patch(`/products/${selectedProduct.id}`, payload);
            toast.success('Cập nhật thành công');
            setIsEditOpen(false); fetchProducts();
        } catch (error: any) { toast.error(error.response?.data?.message || 'Có lỗi xảy ra'); } finally { setIsLoading(false); }
    };

    const renderProductForm = (mode: 'add' | 'edit') => {
        const selectedBrandObj = brands.find(b => b.name === formData.brand);
        const availableModels = selectedBrandObj ? selectedBrandObj.models : [];
        const selectedModelObj = availableModels.find((m: any) => m.name === formData.modelName);
        const availableVariants = selectedModelObj ? selectedModelObj.variants || [] : [];
        const steps = [
            { num: 1, title: 'Thông tin chung', desc: 'Bản & Giá bán', id: 'section-1' },
            { num: 2, title: 'Thông tin thiết yếu', desc: 'Hãng, dòng & tình trạng', id: 'section-2' },
            { num: 3, title: 'Thông số & Động cơ', desc: 'Hiệu suất & Truyền động', id: 'section-3' },
            { num: 4, title: 'Kích thước', desc: 'Trọng lượng & Chiều dài', id: 'section-4' },
            { num: 5, title: 'Nhiên liệu', desc: 'Dung tích & Tiêu thụ', id: 'section-5' },
            { num: 6, title: 'Tiện nghi', desc: 'Nội thất & Công nghệ', id: 'section-6' },
            { num: 7, title: 'An toàn', desc: 'Tính năng an toàn', id: 'section-7' },
            { num: 8, title: 'Biến thể màu', desc: 'Hình ảnh chi tiết', id: 'section-8' },
        ];

        const scrollToSection = (id: string) => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        };

        return (
            <div className="flex bg-slate-50 w-full h-full text-slate-900 font-sans overflow-hidden">
                {/* Sidebar Progress Navigation */}
                <div className="hidden md:flex flex-col w-72 p-8 border-r border-slate-200 overflow-y-auto custom-scrollbar shrink-0 bg-white">
                    <div className="mb-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{mode === 'add' ? 'New Entry' : 'Edit Entry'}</span>
                        <h3 className="text-2xl font-extrabold tracking-tight mt-1">{mode === 'add' ? 'Thêm xe mới' : 'Hiệu chỉnh'}</h3>
                    </div>
                    <nav className="flex-1 space-y-4">
                        {steps.map((step) => (
                            <div 
                                key={step.num} 
                                onClick={() => scrollToSection(step.id)}
                                className="flex items-start gap-4 py-3 opacity-60 hover:opacity-100 hover:bg-slate-50 p-2 rounded-xl transition-all cursor-pointer group"
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">{step.num}</div>
                                <div>
                                    <span className="block text-sm font-bold text-slate-900 leading-tight">{step.title}</span>
                                    <span className="block text-[11px] text-slate-500 mt-0.5">{step.desc}</span>
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Main Form Area */}
                <div className="flex-1 flex flex-col relative bg-slate-50 min-h-0">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 min-h-0">
                        <div className="max-w-4xl mx-auto space-y-16 pb-24 min-h-0">
                            
                            <section id="section-1" className="scroll-mt-12">
                                <header className="mb-8">
                                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase italic">1. Thông tin chung</h2>
                                    <p className="text-slate-500 mt-2 text-sm">Nhập thông báo cơ bản và giá bán niêm yết.</p>
                                </header>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Tên xe niêm yết</Label>
                                        <Input name="name" value={formData.name} onChange={handleChange} className={cn("w-full bg-white border border-slate-200 rounded-2xl h-14 px-6 text-slate-600 shadow-sm transition-all focus:border-blue-300", formErrors.name && "border-red-500")} placeholder="VD: Porsche 911 GT3 RS" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Giá bán (VNĐ)</Label>
                                        <Input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-6 text-blue-600/70 shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Kho hàng (Stock)</Label>
                                        <Input name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-6 font-bold shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Mô tả ngắn</Label>
                                        <Input name="description" value={formData.description} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-6 shadow-sm" placeholder="Tóm tắt ngắn gọn đặc trưng xe..." />
                                    </div>
                                </div>
                            </section>

                            <section id="section-2" className="scroll-mt-12">
                                <header className="mb-8">
                                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase italic">2. Thông tin thiết yếu</h2>
                                </header>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Hãng xe</Label>
                                        <select name="brand" value={formData.brand} onChange={(e) => setFormData(p => ({ ...p, brand: e.target.value, modelName: '', variant: '' }))} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-5 font-bold shadow-sm">
                                            <option value="">-- Chọn hãng --</option>
                                            {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Dòng xe</Label>
                                        <select name="modelName" value={formData.modelName} onChange={(e) => setFormData(p => ({ ...p, modelName: e.target.value, variant: '' }))} disabled={!formData.brand} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-5 font-bold shadow-sm">
                                            <option value="">-- Chọn dòng --</option>
                                            {availableModels.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Năm sản xuất</Label>
                                        <Input name="year" type="number" value={formData.year} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-6 font-bold shadow-sm" />
                                    </div>
                                </div>
                                <div className="mt-8 space-y-4">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Tình trạng xe</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div onClick={() => setFormData(p => ({ ...p, condition: 'Xe mới' }))} className={cn("p-4 rounded-xl border-2 cursor-pointer transition-all", formData.condition === 'Xe mới' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300')}>
                                            <div className="font-bold text-slate-900">Xe Mới</div>
                                            <div className="text-xs text-slate-500 mt-1">Chưa đăng ký, chưa qua sử dụng (ODO ~ 0km)</div>
                                        </div>
                                        <div onClick={() => setFormData(p => ({ ...p, condition: 'Xe lướt' }))} className={cn("p-4 rounded-xl border-2 cursor-pointer transition-all", formData.condition === 'Xe lướt' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300')}>
                                            <div className="font-bold text-slate-900">Xe Lướt</div>
                                            <div className="text-xs text-slate-500 mt-1">Đã qua sử dụng, có lịch sử bảo dưỡng và tiêu hao</div>
                                        </div>
                                    </div>
                                </div>

                                {formData.condition === 'Xe lướt' && (
                                    <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-6 mt-6">
                                        <h4 className="font-bold text-blue-900 flex items-center gap-2"><Info className="w-4 h-4"/> Thông tin chi tiết cho xe lướt (Bắt buộc để định giá)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">1. Số km đã chạy (ODO)</Label>
                                                <Input name="mileage" type="number" value={formData.mileage} onChange={handleChange} placeholder="0" className="w-full bg-white border border-slate-200 rounded-xl h-11 px-4 text-slate-600" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">2. Năm đăng ký / Thời gian SD</Label>
                                                <Input name="usageTime" value={formData.usageTime} onChange={handleChange} placeholder="VD: 6 tháng, đk năm 2023" className="w-full bg-white border border-slate-200 rounded-xl h-11 px-4 text-slate-600" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">3. Lịch sử bảo dưỡng</Label>
                                                <select name="maintenanceHistory" value={formData.maintenanceHistory} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl h-11 px-4 text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none flex items-center justify-between" style={{ appearance: 'auto' }}>
                                                    <option value="">-- Chọn lịch sử bảo dưỡng --</option>
                                                    <option value="Thường xuyên">Thường xuyên (Bảo dưỡng đúng định kỳ)</option>
                                                    <option value="Thỉnh thoảng">Thỉnh thoảng (Có bảo dưỡng nhưng không đều)</option>
                                                    <option value="Hiếm khi">Hiếm khi (Ít khi đi bảo dưỡng)</option>
                                                    <option value="Chưa bao giờ">Chưa bao giờ</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">4. Mức hao mòn thực tế</Label>
                                                <Input name="wearAndTear" value={formData.wearAndTear} onChange={handleChange} placeholder="VD: Lốp 90%, trầy xước nhẹ" className="w-full bg-white border border-slate-200 rounded-xl h-11 px-4 text-slate-600" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">5. Lịch sử xe (Rủi ro)</Label>
                                                <Input name="vehicleHistory" value={formData.vehicleHistory} onChange={handleChange} placeholder="VD: Không đâm đụng, thủy kích" className="w-full bg-white border border-slate-200 rounded-xl h-11 px-4 text-slate-600" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">6. Bảo hành còn lại</Label>
                                                <Input name="remainingWarranty" value={formData.remainingWarranty} onChange={handleChange} placeholder="VD: 1 năm hãng" className="w-full bg-white border border-slate-200 rounded-xl h-11 px-4 text-slate-600" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Biển số xe (Tùy chọn)</Label>
                                                <Input name="licensePlate" value={formData.licensePlate} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl h-11 px-4 text-slate-600" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section id="section-3" className="scroll-mt-12">
                                <header className="mb-8">
                                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase italic">3. Thông số & Động cơ</h2>
                                </header>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Nhiên liệu</Label>
                                        <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-5 text-slate-600 shadow-sm">
                                            <option value="">-- Chọn --</option><option value="Xăng">Xăng</option><option value="Diesel">Dầu (Diesel)</option><option value="Điện">Điện</option><option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Hộp số</Label>
                                        <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-5 text-slate-600 shadow-sm">
                                            <option value="">-- Chọn --</option><option value="Số sàn">Số sàn</option><option value="Tự động">Số tự động</option><option value="CVT">Vô cấp (CVT)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Công suất (hp)</Label>
                                        <Input name="maxPower" value={formData.maxPower} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-6 text-slate-600 shadow-sm" />
                                    </div>
                                </div>
                            </section>

                            <section id="section-4" className="scroll-mt-12">
                                <header className="mb-8">
                                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase italic">4. Kích thước</h2>
                                </header>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-2"><Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Dài (mm)</Label><Input type="number" name="length" value={formData.length} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-6 text-slate-600 shadow-sm" /></div>
                                    <div className="space-y-2"><Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Rộng (mm)</Label><Input type="number" name="width" value={formData.width} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-6 text-slate-600 shadow-sm" /></div>
                                    <div className="space-y-2"><Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Cao (mm)</Label><Input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-6 text-slate-600 shadow-sm" /></div>
                                    <div className="space-y-2"><Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Nặng (kg)</Label><Input type="number" name="curbWeight" value={formData.curbWeight} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-6 text-slate-600 shadow-sm" /></div>
                                </div>
                            </section>

                            <section id="section-5" className="scroll-mt-12">
                                <header className="mb-8"><h2 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase italic">5. Nhiên liệu & Tiêu thụ</h2></header>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2"><Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Bình xăng (L)</Label><Input type="number" name="fuelTankCapacity" value={formData.fuelTankCapacity} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-6 text-slate-600 shadow-sm" /></div>
                                    <div className="space-y-2"><Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Trung bình (L/100km)</Label><Input type="number" name="avgFuelConsumption" value={formData.avgFuelConsumption} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl h-14 px-6 text-slate-600 shadow-sm" /></div>
                                </div>
                            </section>

                            <section id="section-6" className="scroll-mt-12">
                                <header className="mb-8"><h2 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase italic">6. Tiện nghi & Công nghệ</h2></header>
                                
                                <div className="space-y-6">
                                    {/* Cơ bản */}
                                    <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Tiêu chuẩn tối thiểu (Cơ bản)</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: 'autoConditioning', label: 'Điều hòa (Tự động)' },
                                                { id: 'infotainment', label: 'Màn hình trung tâm' },
                                                { id: 'appleCarplay', label: 'Apple CarPlay / Android Auto' },
                                            ].map(item => (
                                                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-slate-900">
                                                    <input type="checkbox" name={item.id} id={item.id} checked={formData[item.id as keyof typeof formData] as boolean} onChange={handleChange} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                                                    <Label htmlFor={item.id} className="text-xs font-bold text-slate-700">{item.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Nâng cao */}
                                    <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Đáng tiền (Nâng cao)</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: 'electricSeats', label: 'Ghế da & chỉnh điện' },
                                                { id: 'cruiseControl', label: 'Cruise Control (Ga tự động)' },
                                                { id: 'smartKey', label: 'Smart Key & Start/Stop' },
                                                { id: 'rearAirCon', label: 'Cửa gió hàng ghế sau' },
                                                { id: 'wirelessCharger', label: 'Sạc không dây' },
                                                { id: 'camera360', label: 'Camera 360 độ' },
                                            ].map(item => (
                                                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-slate-900">
                                                    <input type="checkbox" name={item.id} id={item.id} checked={formData[item.id as keyof typeof formData] as boolean} onChange={handleChange} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300" />
                                                    <Label htmlFor={item.id} className="text-xs font-bold text-slate-700">{item.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Cao cấp */}
                                    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-3xl shadow-xl">
                                        <h4 className="font-bold text-white mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Sang xịn (Cao cấp)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { id: 'hud', label: 'HUD (Hiển thị kính lái)' },
                                                { id: 'heatedSeats', label: 'Ghế Sưởi / Làm mát' },
                                                { id: 'sunroof', label: 'Cửa sổ trời (Sunroof/Panoramic)' },
                                                { id: 'premiumAudio', label: 'Dàn âm thanh cao cấp' },
                                            ].map(item => (
                                                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-xl text-white border border-slate-700/50 hover:bg-slate-700 transition-colors">
                                                    <input type="checkbox" name={item.id} id={item.id} checked={formData[item.id as keyof typeof formData] as boolean} onChange={handleChange} className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 border-slate-600 bg-slate-900" />
                                                    <Label htmlFor={item.id} className="text-xs font-medium text-slate-200">{item.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section id="section-7" className="scroll-mt-12">
                                <header className="mb-8"><h2 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase italic">7. An toàn</h2></header>
                                
                                <div className="space-y-6">
                                    {/* Cơ bản */}
                                    <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Bắt buộc phải có (Cơ bản)</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: 'abs', label: 'ABS (Chống bó cứng phanh)' },
                                                { id: 'ebd', label: 'EBD (Phân bổ lực phanh)' },
                                                { id: 'ba', label: 'BA (Hỗ trợ phanh khẩn cấp)' },
                                            ].map(item => (
                                                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-slate-900">
                                                    <input type="checkbox" name={item.id} id={item.id} checked={formData[item.id as keyof typeof formData] as boolean} onChange={handleChange} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                                                    <Label htmlFor={item.id} className="text-xs font-bold text-slate-700">{item.label}</Label>
                                                </div>
                                            ))}
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-slate-900 col-span-2 md:col-span-1">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 px-1">Túi khí</Label>
                                                <Input type="number" name="airbags" value={formData.airbags} onChange={handleChange} className="w-16 h-8 text-center bg-white border-slate-200 shadow-sm" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ổn định & Nâng cao */}
                                    <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Nên có (Giữ ổn định xe)</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: 'esp', label: 'ESC/VSC (Cân bằng điện tử)' },
                                                { id: 'tcs', label: 'TCS (Chống trượt)' },
                                                { id: 'hsa', label: 'HSA (Hỗ trợ ngang dốc)' },
                                                { id: 'rearSensor', label: 'Camera & Cảm biến lùi' },
                                            ].map(item => (
                                                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-slate-900">
                                                    <input type="checkbox" name={item.id} id={item.id} checked={formData[item.id as keyof typeof formData] as boolean} onChange={handleChange} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300" />
                                                    <Label htmlFor={item.id} className="text-xs font-bold text-slate-700">{item.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ADAS */}
                                    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-3xl shadow-xl">
                                        <h4 className="font-bold text-white mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Cao cấp (ADAS Chủ động)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { id: 'aeb', label: 'Phanh khẩn cấp tự động (AEB)' },
                                                { id: 'lka', label: 'Cảnh báo lệch & Kiểm soát làn' },
                                                { id: 'bsm', label: 'Cảnh báo điểm mù (BSM)' },
                                                { id: 'acc', label: 'Cruise Control thích ứng (ACC)' },
                                            ].map(item => (
                                                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-xl text-white border border-slate-700/50 hover:bg-slate-700 transition-colors">
                                                    <input type="checkbox" name={item.id} id={item.id} checked={formData[item.id as keyof typeof formData] as boolean} onChange={handleChange} className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 border-slate-600 bg-slate-900" />
                                                    <Label htmlFor={item.id} className="text-xs font-medium text-slate-200">{item.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section id="section-8" className="scroll-mt-12">
                                <header className="mb-8">
                                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase italic">8. Màu sắc & Hình ảnh</h2>
                                </header>
                                <div className="space-y-8">
                                    {formData.colorVariants.map((variant, vIdx) => (
                                        <div key={vIdx} className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm relative">
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Biến thể màu #{vIdx + 1}</h4>
                                                {formData.colorVariants.length > 1 && (
                                                    <Button variant="ghost" size="icon" onClick={() => setFormData(p => ({ ...p, colorVariants: p.colorVariants.filter((_, i) => i !== vIdx) }))} className="text-red-400 hover:text-red-600 h-8 w-8 rounded-full">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                                <div className="flex flex-wrap gap-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    {CAR_COLORS.map(c => (
                                                        <button key={c.name} type="button" onClick={() => { const nv = [...formData.colorVariants]; nv[vIdx].color = c.name; setFormData(p => ({ ...p, colorVariants: nv })); }} className={cn("w-8 h-8 rounded-full ring-offset-2 transition-all", variant.color === c.name ? 'ring-2 ring-blue-600 scale-110' : 'border border-slate-200 opacity-60 hover:opacity-100 hover:scale-110')} style={{ backgroundColor: c.hex }} title={c.name} />
                                                    ))}
                                                </div>
                                                <div className="relative h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer over:border-blue-300">
                                                    <input type="file" multiple onChange={(e) => handleVariantFileChange(vIdx, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                    <Plus className="w-6 h-6 text-slate-300" />
                                                </div>
                                            </div>
                                            {variant.images.length > 0 && (
                                                <div className="flex flex-wrap gap-4">
                                                    {variant.images.map((img, iIdx) => (
                                                        <div key={iIdx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-100 shadow-sm group">
                                                            <img src={img} className="w-full h-full object-cover" />
                                                            <button type="button" onClick={() => { const nv = [...formData.colorVariants]; nv[vIdx].images.splice(iIdx, 1); setFormData(p => ({ ...p, colorVariants: nv })); }} className="absolute top-1 right-1 bg-white/90 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <Button variant="outline" type="button" onClick={() => setFormData(p => ({ ...p, colorVariants: [...p.colorVariants, { color: '', images: [] }] }))} className="w-full py-10 border-2 border-dashed border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 rounded-3xl text-slate-400 hover:text-blue-600 font-bold uppercase text-[10px] tracking-[0.2em] transition-all">
                                        <Plus className="mr-2 w-4 h-4" /> Thêm biến thể màu
                                    </Button>
                                </div>
                            </section>

                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 bg-white border-t border-slate-200 flex items-center justify-end sticky bottom-0 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                        <Button type="button" onClick={mode === 'add' ? handleAdd : handleEdit} disabled={isLoading} className="bg-slate-900 hover:bg-black text-white px-12 py-7 rounded-full font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl flex items-center gap-3 transition-all h-14 cursor-pointer">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'add' ? 'Tạo xe mới' : 'Lưu thay đổi')}
                            {!isLoading && <ChevronRight className="w-4 h-4 ml-1" />}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Header Section with Asymmetric Layout */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Quản lý Kho hàng</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">Quản lý sản phẩm</h1>
                    <p className="mt-4 text-slate-500 max-w-md leading-relaxed">Quản lý kho tài sản xe hơi cao cấp. Theo dõi trạng thái đấu giá, số liệu hiệu suất và lịch sử giao dịch theo thời gian thực.</p>
                </div>
                <button onClick={() => { setIsAddOpen(true); setFormData(p => ({ ...p, colorVariants: [{ color: '', images: [] }] })); }} className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 shrink-0">
                    <span className="material-symbols-outlined">add_circle</span>
                    <span>Thêm xe mới</span>
                </button>
            </div>

            {/* Stats Tonal Layering Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-blue-600">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-blue-600">directions_car</span>
                        <span className="text-xs font-bold text-blue-600">Tổng quan</span>
                    </div>
                    <h3 className="mt-4 text-3xl font-bold">{products.length}</h3>
                    <p className="text-sm text-slate-500 font-medium">Tổng số xe</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-emerald-600">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                        <span className="text-xs font-bold text-emerald-600">Sẵn sàng</span>
                    </div>
                    <h3 className="mt-4 text-3xl font-bold">{products.filter(p => p.status).length}</h3>
                    <p className="text-sm text-slate-500 font-medium">Đang mở bán</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-orange-500">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-orange-500">pending_actions</span>
                        <span className="text-xs font-bold text-orange-500">Tạm dừng</span>
                    </div>
                    <h3 className="mt-4 text-3xl font-bold">{products.filter(p => !p.status).length}</h3>
                    <p className="text-sm text-slate-500 font-medium">Tạm ẩn</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200/50">
                <div className="flex items-center gap-2">
                    <button className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold">Tất cả xe</button>
                    <button className="px-5 py-2 rounded-full bg-slate-100 text-slate-500 text-xs font-bold hover:bg-slate-200 transition-colors">Đang bán</button>
                    <button className="px-5 py-2 rounded-full bg-slate-100 text-slate-500 text-xs font-bold hover:bg-slate-200 transition-colors">Đã bán</button>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-sm">sort</span>
                        Mới nhất
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex h-[40vh] items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-blue-600" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-slate-100">
                            <div className="relative h-64 overflow-hidden">
                                <img src={product.imageUrl || '/images/static/car-placeholder.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                                <div className="absolute top-4 left-4">
                                    <span className={cn("text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg", product.status ? "bg-blue-600 shadow-blue-600/20" : "bg-slate-600 shadow-slate-600/20")}>
                                        {product.status ? 'Đang mở bán' : 'Tạm ẩn'}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 right-4 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-900">
                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                                    <span className="text-xs font-bold">{product.stock} chiếc</span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold tracking-tight line-clamp-1">{product.year} {product.brand} {product.modelName}</h3>
                                </div>
                                <p className="text-sm font-bold text-slate-500 mb-4 line-clamp-1">{product.name}</p>
                                
                                <div className="flex gap-4 mb-6">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <span className="material-symbols-outlined text-base">speed</span>
                                        <span>{product.mileage ? `${product.mileage.toLocaleString('vi-VN')} km` : 'Hàng mới'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <span className="material-symbols-outlined text-base">local_gas_station</span>
                                        <span>{product.fuelType || 'Chưa rõ'}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-slate-900 font-bold text-lg">{product.price.toLocaleString('vi-VN')} <span className="text-[10px] text-slate-400 align-top ml-0.5">VNĐ</span></span>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setSelectedProduct(product); setFormData({ ...product, price: product.price.toString(), stock: product.stock.toString(), year: product.year?.toString() || '', condition: product.condition || 'Xe mới', usageTime: product.usageTime || '', maintenanceHistory: product.maintenanceHistory || '',  wearAndTear: product.wearAndTear || '', vehicleHistory: product.vehicleHistory || '', remainingWarranty: product.remainingWarranty || '', colorVariants: product.colorVariants?.map((cv: any) => ({ color: cv.color, images: cv.images?.map((im: any) => im.url) || [] })) || [{ color: '', images: [] }] }); setIsEditOpen(true); }} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 w-8 h-8 rounded flex items-center justify-center transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button onClick={async () => { if (confirm('Xóa vĩnh viễn sản phẩm này?')) { try { await http.delete(`/products/${product.id}`); toast.success('Đã xóa'); fetchProducts(); } catch (err) { toast.error('Lỗi'); } } }} className="text-slate-400 hover:text-red-600 hover:bg-red-50 w-8 h-8 rounded flex items-center justify-center transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent aria-describedby={undefined} className="max-w-7xl rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-white w-[95vw] h-[90vh]">
<DialogTitle className="sr-only">Dialog Form</DialogTitle>
                    {renderProductForm('add')}
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent aria-describedby={undefined} className="max-w-7xl rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-white w-[95vw] h-[90vh]">
<DialogTitle className="sr-only">Dialog Form</DialogTitle>
                    {renderProductForm('edit')}
                </DialogContent>
            </Dialog>
        </div>
    );
}
