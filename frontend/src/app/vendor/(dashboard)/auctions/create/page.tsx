"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { ArrowLeft, Save, Plus, Trash2, Video, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';
import http from '@/lib/http';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function CreateAuctionPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isLivestream, setIsLivestream] = useState(false);

    const { register, handleSubmit, control, watch, setValue } = useForm({
        defaultValues: {
            title: '',
            description: '',
            startPrice: '',
            bidStep: '',
            type: 'OFFLINE',
            streamUrl: '',
            startTime: '',
            endTime: '',
            items: [{ productId: '', orderIndex: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const selectedType = watch('type');

    useEffect(() => {
        setIsLivestream(selectedType === 'LIVESTREAM');
    }, [selectedType]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const userObj = JSON.parse(localStorage.getItem('user') || '{}');
                
                const res = await http.get('/products');
                const data = res.data;
                
                if (data && Array.isArray(data)) {
                    // Filter to only products owned by this vendor
                    const myProducts = data.filter((p: any) => p.vendor?.id === userObj.id || p.vendorId === userObj.id);
                    setProducts(myProducts);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            const token = Cookies.get('token');
            const payload = {
                ...data,
                startPrice: Number(data.startPrice),
                bidStep: Number(data.bidStep),
                startTime: new Date(data.startTime).toISOString(),
                endTime: new Date(data.endTime).toISOString(),
                items: data.items.map((item: any, index: number) => ({
                    productId: Number(item.productId),
                    orderIndex: isLivestream ? index : 0
                }))
            };

            const res = await http.post('/auctions', payload);

            if (res.data) {
                toast.success('Tạo phiên đấu giá thành công');
                router.push('/vendor/auctions');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Lỗi hệ thống');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/vendor/auctions">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tạo phiên đấu giá mới</h1>
                    <p className="text-slate-500 text-sm">Thiết lập các thông số cơ bản và chọn xe để bán.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-lg">1. Thông tin chung</CardTitle>
                        <CardDescription>Tiêu đề và thiết lập hình thức đấu giá.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="font-semibold text-slate-700">Tên phiên đấu giá <span className="text-red-500">*</span></Label>
                            <Input id="title" placeholder="VD: Đấu giá Siêu xe Mercedes-Benz S450 dọn kho đón Tết..." {...register('title', { required: true })} className="h-11 border-slate-200 focus-visible:ring-orange-500" />
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="font-semibold text-slate-700">Hình thức đấu giá <span className="text-red-500">*</span></Label>
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        <div className={`border-2 rounded-xl p-4 flex items-start space-x-3 cursor-pointer transition-colors ${field.value === 'OFFLINE' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <RadioGroupItem value="OFFLINE" id="offline" className="mt-1" />
                                            <div>
                                                <Label htmlFor="offline" className="font-bold text-indigo-900 text-base cursor-pointer">Offline (Tiêu chuẩn)</Label>
                                                <p className="text-sm text-slate-500 mt-1">Đấu giá 1 chiếc xe tĩnh. Khách hàng xem ảnh và đặt giá trên màn hình đếm ngược.</p>
                                            </div>
                                        </div>
                                        <div className={`border-2 rounded-xl p-4 flex items-start space-x-3 cursor-pointer transition-colors ${field.value === 'LIVESTREAM' ? 'border-rose-600 bg-rose-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <RadioGroupItem value="LIVESTREAM" id="livestream" className="mt-1" />
                                            <div>
                                                <Label htmlFor="livestream" className="font-bold text-rose-900 text-base cursor-pointer">Livestream (Trực tiếp)</Label>
                                                <p className="text-sm text-slate-500 mt-1">Phát video trực tiếp và lần lượt đem ra đấu giá nhiều chiếc xe khác nhau trong phiên.</p>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        {isLivestream && (
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-3">
                                <Label className="font-bold text-amber-900 flex items-center gap-2">
                                    <Video className="w-5 h-5" /> Nguồn Livestream
                                </Label>
                                <p className="text-sm text-amber-700">Bạn có thể dán link Youtube/Facebook vào đây. Nếu bỏ trống, hệ thống sẽ mở tính năng WebRTC tự bật Camera trên trình duyệt lúc bắt đầu phiên.</p>
                                <Input placeholder="https://youtube.com/watch?v=..." {...register('streamUrl')} className="bg-white border-amber-300 focus-visible:ring-amber-500" />
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="description" className="font-semibold text-slate-700">Mô tả/Thể lệ luật chơi</Label>
                            <Textarea id="description" placeholder="Nhập thêm mô tả về tình trạng, nội quy trả giá..." {...register('description')} className="min-h-[100px] border-slate-200 focus-visible:ring-orange-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-lg">2. Sản phẩm & Cấu hình giá</CardTitle>
                        <CardDescription>Chọn xe tham gia đấu giá mức giá Khởi Điểm.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="font-semibold text-slate-700 text-base flex items-center gap-2"><Package className="w-5 h-5" /> Danh sách xe đấu giá</Label>
                                {isLivestream && (
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', orderIndex: fields.length })} className="gap-1 border-orange-200 text-orange-600 hover:bg-orange-50">
                                        <Plus className="w-4 h-4" /> Thêm xe
                                    </Button>
                                )}
                            </div>
                            
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 relative">
                                        {isLivestream && (
                                            <div className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                                {index + 1}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <Controller
                                                name={`items.${index}.productId`}
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder="-- Chọn một chiếc xe của bạn --" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {products.map(p => (
                                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                                    {p.name} - (Giá gốc: {p.price.toLocaleString()}đ)
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        {isLivestream && index > 0 && (
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {products.length === 0 && (
                                    <div className="text-sm text-red-500 italic px-2">Bạn không có chiếc xe nào trong kho. Hãy đăng bán một sản phẩm trước!</div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                            <div className="space-y-2">
                                <Label htmlFor="startPrice" className="font-semibold text-slate-700">Giá khởi điểm (VNĐ) <span className="text-red-500">*</span></Label>
                                <Input id="startPrice" type="number" placeholder="VD: 500000000" {...register('startPrice', { required: true, min: 0 })} className="font-mono text-lg" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bidStep" className="font-semibold text-slate-700">Bước nhảy giá tối thiểu (VNĐ) <span className="text-red-500">*</span></Label>
                                <Input id="bidStep" type="number" placeholder="VD: 5000000" {...register('bidStep', { required: true, min: 0 })} className="font-mono text-lg" />
                                <p className="text-xs text-slate-500">Mỗi lần khách trả giá phải cao hơn giá hiện tại ít nhất bằng mức này.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-lg">3. Thời gian</CardTitle>
                        <CardDescription>Thiết lập thời gian mở cửa.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="startTime" className="font-semibold text-slate-700">Thời gian Bắt đầu <span className="text-red-500">*</span></Label>
                            <Input id="startTime" type="datetime-local" {...register('startTime', { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime" className="font-semibold text-slate-700">Thời gian Kết thúc dự kiến <span className="text-red-500">*</span></Label>
                            <Input id="endTime" type="datetime-local" {...register('endTime', { required: true })} />
                            <p className="text-xs text-amber-600">Lưu ý: Thời gian kết thúc có thể tự động kéo dài thêm 5 phút nếu có người đấu giá vào phút chót (Sniper Protection).</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Link href="/vendor/auctions">
                        <Button type="button" variant="outline" className="px-8 border-slate-300">Hủy bỏ</Button>
                    </Link>
                    <Button type="submit" disabled={loading} className="px-8 bg-orange-600 hover:bg-orange-700 gap-2">
                        <Save className="w-4 h-4" />
                        {loading ? 'Đang tạo...' : 'Lưu và Ra Mắt Phiên'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
