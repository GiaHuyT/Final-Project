"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { ArrowLeft, Save, Plus, Trash2, Video, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'react-hot-toast';
import http from '@/lib/http';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function EditAuctionPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isLivestream, setIsLivestream] = useState(false);

    const { register, handleSubmit, control, watch, setValue, reset, formState: { errors }, trigger } = useForm({
        mode: 'all',
        criteriaMode: 'all',
        defaultValues: {
            title: '',
            description: '',
            startPrice: '',
            bidStep: '',
            type: 'OFFLINE',
            streamSourceType: 'EXTERNAL',
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
    const streamSourceType = watch('streamSourceType');

    useEffect(() => {
        setIsLivestream(selectedType === 'LIVESTREAM');
        trigger('streamUrl');
    }, [selectedType, streamSourceType, trigger]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Fetch products
                const productsRes = await http.get('/products');
                if (productsRes.data && Array.isArray(productsRes.data)) {
                    setProducts(productsRes.data);
                }

                // 2. Fetch auction details
                if (id) {
                    const auctionRes = await http.get(`/auctions/${id}`);
                    const auction = auctionRes.data;

                    // Check if auction is too close to start time (5 mins)
                    const now = new Date();
                    const startTime = new Date(auction.startTime);
                    if (startTime.getTime() - now.getTime() < 5 * 60 * 1000) {
                        toast.error('Chỉ được chỉnh sửa trước giờ bắt đầu 5 phút.');
                        router.push('/admin/auctions');
                        return;
                    }

                    const toLocalDatetime = (isoStr: string) => {
                        const date = new Date(isoStr);
                        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                        return date.toISOString().slice(0, 16);
                    };

                    reset({
                        title: auction.title,
                        description: auction.description || '',
                        startPrice: auction.startPrice.toLocaleString('vi-VN'),
                        bidStep: auction.bidStep.toLocaleString('vi-VN'),
                        type: auction.type,
                        streamSourceType: auction.streamUrl ? 'EXTERNAL' : 'INTERNAL',
                        streamUrl: auction.streamUrl || '',
                        startTime: toLocalDatetime(auction.startTime),
                        endTime: toLocalDatetime(auction.endTime),
                        items: auction.items.map((i: any) => ({
                            productId: i.productId.toString(),
                            orderIndex: i.orderIndex
                        }))
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error('Lỗi tải dữ liệu phiên đấu giá');
                router.push('/admin/auctions');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchInitialData();
    }, [id, reset, router]);

    const onSubmit = async (data: any) => {
        const isValid = await trigger();
        if (!isValid) {
            toast.error('Vui lòng kiểm tra lại các trường bị lỗi');
            return;
        }

        try {
            setLoading(true);
            const token = Cookies.get('token');
            const { streamSourceType, ...restData } = data;

            const payload = {
                ...restData,
                startPrice: Number(data.startPrice.toString().replace(/\./g, '')),
                bidStep: Number(data.bidStep.toString().replace(/\./g, '')),
                startTime: new Date(data.startTime).toISOString(),
                endTime: new Date(data.endTime).toISOString(),
                streamUrl: streamSourceType === 'INTERNAL' ? '' : data.streamUrl,
                items: data.items.map((item: any, index: number) => ({
                    productId: Number(item.productId),
                    orderIndex: isLivestream ? index : 0
                }))
            };

            const res = await http.put(`/auctions/${id}`, payload);

            if (res.data) {
                toast.success('Cập nhật phiên đấu giá thành công');
                router.push('/admin/auctions');
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
                <Link href="/admin/auctions">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa phiên đấu giá</h1>
                    <p className="text-slate-500 text-sm">Cập nhật thông số trước khi phiên đấu giá bắt đầu.</p>
                </div>
            </div>

            {initialLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-lg">1. Thông tin chung</CardTitle>
                        <CardDescription>Tiêu đề và thiết lập hình thức đấu giá.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="font-semibold text-slate-700">Tên phiên đấu giá <span className="text-red-500">*</span></Label>
                            <Input id="title" placeholder="VD: Đấu giá Siêu xe Mercedes-Benz S450 dọn kho đón Tết..." {...register('title', { required: 'Vui lòng nhập tên phiên đấu giá' })} className="h-11 border-slate-200 focus-visible:ring-blue-500 placeholder:text-slate-400/60" />
                            {errors.title && <span className="text-red-500 text-xs font-medium">{errors.title.message as string}</span>}
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
                                                <Label htmlFor="offline" className="font-bold text-indigo-900 text-base cursor-pointer">Online (Tiêu chuẩn)</Label>
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
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-4">
                                <Label className="font-bold text-amber-900 flex items-center gap-2">
                                    <Video className="w-5 h-5" /> Nguồn Livestream
                                </Label>

                                <Controller
                                    name="streamSourceType"
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            <div className={`border rounded-lg p-3 flex items-start space-x-3 cursor-pointer transition-colors ${field.value === 'EXTERNAL' ? 'border-amber-500 bg-amber-100/50' : 'border-amber-200 bg-white hover:border-amber-300'}`}>
                                                <RadioGroupItem value="EXTERNAL" id="stream-external" className="mt-1 border-amber-500 text-amber-600 data-[state=checked]:border-amber-600 data-[state=checked]:text-amber-600" />
                                                <div>
                                                    <Label htmlFor="stream-external" className="font-semibold text-amber-900 text-sm cursor-pointer">Nhập link (Youtube/Facebook)</Label>
                                                </div>
                                            </div>
                                            <div className={`border rounded-lg p-3 flex items-start space-x-3 cursor-pointer transition-colors ${field.value === 'INTERNAL' ? 'border-amber-500 bg-amber-100/50' : 'border-amber-200 bg-white hover:border-amber-300'}`}>
                                                <RadioGroupItem value="INTERNAL" id="stream-internal" className="mt-1 border-amber-500 text-amber-600 data-[state=checked]:border-amber-600 data-[state=checked]:text-amber-600" />
                                                <div>
                                                    <Label htmlFor="stream-internal" className="font-semibold text-amber-900 text-sm cursor-pointer">Live trực tiếp trên web</Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />

                                {streamSourceType !== 'INTERNAL' ? (
                                    <div className="space-y-2 pt-2">
                                        <p className="text-sm text-amber-700">Dán link Youtube/Facebook vào đây để phát trực tiếp buổi đấu giá.</p>
                                        <Input placeholder="https://youtube.com/watch?v=..." {...register('streamUrl', {
                                            validate: (val) => {
                                                if (isLivestream && streamSourceType !== 'INTERNAL' && !val) return 'Vui lòng nhập link livestream';
                                                return true;
                                            }
                                        })} className="bg-white border-amber-300 focus-visible:ring-amber-500 placeholder:text-slate-400/60" />
                                        {errors.streamUrl && <span className="text-red-500 text-xs font-medium">{errors.streamUrl.message as string}</span>}
                                    </div>
                                ) : (
                                    <div className="bg-white border border-amber-200 rounded-lg p-3 mt-2">
                                        <p className="text-sm text-amber-800">
                                            Hệ thống sẽ cung cấp giao diện phát trực tiếp bằng Camera/Microphone trên website khi phiên bắt đầu.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="description" className="font-semibold text-slate-700">Mô tả/Thể lệ luật chơi</Label>
                            <Textarea id="description" placeholder="Nhập thêm mô tả về tình trạng, nội quy trả giá..." {...register('description')} className="min-h-[100px] border-slate-200 focus-visible:ring-blue-500 placeholder:text-slate-400/60" />
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
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', orderIndex: fields.length })} className="gap-1 border-blue-200 text-blue-600 hover:bg-blue-50">
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
                                                rules={{ required: 'Vui lòng chọn xe' }}
                                                render={({ field }) => (
                                                    <div className="space-y-1">
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="bg-white">
                                                                <SelectValue placeholder="-- Chọn một chiếc xe của bạn --" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {products.map(p => (
                                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                                        {p.name} - (Giá gốc: {p.price.toLocaleString('vi-VN')}đ)
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors?.items?.[index]?.productId && <span className="text-red-500 text-xs font-medium">{errors.items[index].productId?.message as string}</span>}
                                                    </div>
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
                                <Controller
                                    name="startPrice"
                                    control={control}
                                    rules={{ required: 'Vui lòng nhập giá khởi điểm' }}
                                    render={({ field: { onChange, value } }) => (
                                        <div className="space-y-1">
                                            <Input
                                                id="startPrice"
                                                type="text"
                                                value={value}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/\D/g, '');
                                                    const formatted = rawValue ? Number(rawValue).toLocaleString('vi-VN') : '';
                                                    onChange(formatted);
                                                }}
                                                placeholder="VD: 500.000.000"
                                                className="font-mono text-lg placeholder:text-slate-400/60 placeholder:font-sans"
                                            />
                                            {errors.startPrice && <span className="text-red-500 text-xs font-medium">{errors.startPrice.message as string}</span>}
                                        </div>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bidStep" className="font-semibold text-slate-700">Bước nhảy giá tối thiểu (VNĐ) <span className="text-red-500">*</span></Label>
                                <Controller
                                    name="bidStep"
                                    control={control}
                                    rules={{ required: 'Vui lòng nhập bước nhảy giá' }}
                                    render={({ field: { onChange, value } }) => (
                                        <div className="space-y-1">
                                            <Input
                                                id="bidStep"
                                                type="text"
                                                value={value}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/\D/g, '');
                                                    const formatted = rawValue ? Number(rawValue).toLocaleString('vi-VN') : '';
                                                    onChange(formatted);
                                                }}
                                                placeholder="VD: 5.000.000"
                                                className="font-mono text-lg placeholder:text-slate-400/60 placeholder:font-sans"
                                            />
                                            {errors.bidStep && <span className="text-red-500 text-xs font-medium">{errors.bidStep.message as string}</span>}
                                        </div>
                                    )}
                                />
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
                            <Input id="startTime" type="datetime-local" {...register('startTime', {
                                required: 'Vui lòng chọn thời gian bắt đầu',
                                validate: {
                                    minTime: (value) => {
                                        const start = new Date(value).getTime();
                                        const now = new Date().getTime();
                                        return start >= now + 5 * 60 * 1000 || 'Thời gian bắt đầu phải cách hiện tại tối thiểu 5 phút';
                                    },
                                    maxTime: (value) => {
                                        const start = new Date(value).getTime();
                                        const now = new Date().getTime();
                                        return start <= now + 2 * 60 * 60 * 1000 || 'Thời gian bắt đầu tối đa chỉ được cách hiện tại 2 tiếng';
                                    }
                                }
                            })} />
                            {errors.startTime && <span className="text-red-500 text-xs font-medium">{errors.startTime.message as string}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime" className="font-semibold text-slate-700">Thời gian Kết thúc dự kiến <span className="text-red-500">*</span></Label>
                            <Input id="endTime" type="datetime-local" {...register('endTime', {
                                required: 'Vui lòng chọn thời gian kết thúc',
                                validate: {
                                    minDuration: (value, formValues) => {
                                        if (!formValues.startTime) return true;
                                        const start = new Date(formValues.startTime).getTime();
                                        const end = new Date(value).getTime();
                                        return end >= start + 10 * 60 * 1000 || 'Thời gian đấu giá tối thiểu phải là 10 phút';
                                    }
                                }
                            })} />
                            {errors.endTime && <span className="text-red-500 text-xs font-medium">{errors.endTime.message as string}</span>}
                            <p className="text-xs text-amber-600">Lưu ý: Thời gian kết thúc có thể tự động kéo dài thêm 5 phút nếu có người đấu giá vào phút chót (Sniper Protection).</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Link href="/admin/auctions">
                        <Button type="button" variant="outline" className="px-8 border-slate-300">Hủy bỏ</Button>
                    </Link>
                    <Button type="submit" disabled={loading} className="px-8 bg-blue-600 text-white hover:bg-blue-700 gap-2">
                        <Save className="w-4 h-4" />
                        {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </Button>
                </div>
            </form>
            )}
        </div>
    );
}
