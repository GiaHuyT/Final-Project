'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import http from '@/lib/http';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import {
    User,
    Clock,
    Bell,
    Box,
    Wrench,
    Store,
    Truck,
    TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

import ProductsTab from './components/ProductsTab';
import OrdersTab from './components/OrdersTab';
import RentalCarsTab from './components/RentalCarsTab';
import RepairsTab from './components/RepairsTab';

// Schema validation
const profileSchema = z.object({
    email: z.string().email(),
    username: z.string().min(2, "Tên nhà cung cấp phải có ít nhất 2 ký tự"),
    phonenumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;



export default function SupplierPage() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userNameDisplay, setUserNameDisplay] = useState("Nhà cung cấp");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [tab, setTab] = useState("profile");

    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [rentals, setRentals] = useState<any[]>([]);
    const [repairs, setRepairs] = useState<any[]>([]);

    // Setup form
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    // Fetch data
    const fetchData = async () => {
        try {
            const { data: profileData } = await http.get('/users/profile');
            setUserNameDisplay(profileData.username || "Nhà cung cấp");
            setAvatarUrl(profileData.avatar || null);
            reset({
                email: profileData.email,
                username: profileData.username,
                phonenumber: profileData.phonenumber || "",
            });

            // Fetch Vendor Products
            const { data: productsData } = await http.get('/products/vendor/me');
            setProducts(productsData || []);

            // Fetch Vendor Orders
            const { data: ordersData } = await http.get('/orders/vendor/me');
            setOrders(ordersData || []);

            // Fetch Vendor Rental Cars
            const { data: rentalsData } = await http.get('/rental-cars/vendor/me');
            setRentals(rentalsData || []);

            // Fetch Vendor Repairs
            const { data: repairsData } = await http.get('/repairs/vendor/me');
            setRepairs(repairsData || []);

        } catch (error) {
            console.error('Fetch Data Error:', error);
            toast.error('Không thể tải thông tin dữ liệu nhà cung cấp');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [reset]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn tệp ảnh!');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ảnh quá lớn (tối đa 2MB)!');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await http.post('/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.status === 201 || res.status === 200) {
                const newUrl = res.data.avatarUrl;
                setAvatarUrl(newUrl);

                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const userObj = JSON.parse(storedUser);
                    userObj.avatar = newUrl;
                    localStorage.setItem("user", JSON.stringify(userObj));
                }

                toast.success('Cập nhật logo thành công!');
            }
        } catch (error: any) {
            console.error('Lỗi khi tải ảnh:', error);
            toast.error(error.response?.data?.message || 'Không thể tải ảnh lên.');
        } finally {
            setIsUploading(false);
        }
    };

    // Handle Submit
    const onSubmit = async (values: ProfileFormValues) => {
        setIsSaving(true);
        try {
            await http.patch('/users/profile', {
                username: values.username,
                phonenumber: values.phonenumber
            });
            setUserNameDisplay(values.username);

            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                userObj.username = values.username;
                userObj.phonenumber = values.phonenumber;
                localStorage.setItem("user", JSON.stringify(userObj));
            }

            toast.success('Cập nhật hồ sơ nhà cung cấp thành công!');
        } catch (error: any) {
            console.error('Update Profile Error:', error);
            const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsSaving(false);
        }
    };

    const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${active ? 'text-orange-600 bg-orange-50 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
        >
            <Icon className="w-5 h-5" />
            <span className="text-sm">{label}</span>
            {active && <span className="ml-auto text-xs">›</span>}
        </div>
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50/50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 md:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Sidebar */}
                <div className="md:col-span-3 lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-hidden">
                        <div className="space-y-1">
                            <SidebarItem icon={Store} label="Hồ sơ nhà cung cấp" active={tab === "profile"} onClick={() => setTab("profile")} />
                            <SidebarItem icon={Box} label="Quản lý sản phẩm" active={tab === "products"} onClick={() => setTab("products")} />
                            <SidebarItem icon={Clock} label="Quản lý đơn hàng" active={tab === "orders"} onClick={() => setTab("orders")} />
                            <SidebarItem icon={Truck} label="Xe thuê" active={tab === "rentals"} onClick={() => setTab("rentals")} />
                            <SidebarItem icon={Wrench} label="Sửa chữa" active={tab === "repairs"} onClick={() => setTab("repairs")} />
                            <SidebarItem icon={Bell} label="Thông báo" active={tab === "notifications"} onClick={() => setTab("notifications")} />
                            <SidebarItem icon={TrendingUp} label="Báo cáo doanh thu" active={tab === "revenue"} onClick={() => setTab("revenue")} />
                        </div>
                    </div>

                    <Button variant="outline" className="w-full bg-white border-dashed border-gray-300 hover:border-orange-500 hover:text-orange-600 h-10 p-0 overflow-hidden">
                        <Link href="/profile" className="flex items-center justify-center w-full h-full gap-2">
                            <User className="w-4 h-4" />
                            Tài khoản cá nhân
                        </Link>
                    </Button>
                </div>

                {/* Main Content */}
                <div className="md:col-span-9 lg:col-span-9">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">

                        {/* Header & Avatar */}
                        <div className="space-y-6 border-b border-gray-100 pb-8">
                            <h1 className="text-2xl text-gray-800 font-normal">
                                Nhà cung cấp: <span className="font-semibold">{userNameDisplay}</span>
                            </h1>

                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24 border-4 border-gray-50 shadow-sm relative overflow-hidden group">
                                    <AvatarImage src={avatarUrl || ""} alt={userNameDisplay} />
                                    <AvatarFallback className="text-2xl bg-gray-100 text-gray-500">
                                        {userNameDisplay.substring(0, 1).toUpperCase()}
                                    </AvatarFallback>
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        </div>
                                    )}
                                </Avatar>
                                <div className="flex gap-3">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <Button
                                        onClick={handleAvatarClick}
                                        disabled={isUploading}
                                        className="bg-[#E65E2C] hover:bg-[#d95222] text-white"
                                    >
                                        {isUploading ? "Uploading..." : "Upload Logo"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="text-gray-600 border-gray-200"
                                        disabled={isUploading}
                                        onClick={async () => {
                                            if (!avatarUrl) return;
                                            if (!confirm('Xóa ảnh đại diện?')) return;
                                            try {
                                                await http.patch('/users/profile', { avatar: null });
                                                setAvatarUrl(null);
                                                const storedUser = localStorage.getItem("user");
                                                if (storedUser) {
                                                    const userObj = JSON.parse(storedUser);
                                                    userObj.avatar = null;
                                                    localStorage.setItem("user", JSON.stringify(userObj));
                                                }
                                                toast.success('Đã xóa ảnh đại diện');
                                            } catch (e) {
                                                toast.error('Không thể xóa ảnh');
                                            }
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        {tab === "profile" && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-6">Thông tin nhà cung cấp</h2>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="username" className="text-sm font-medium text-gray-700">Tên cửa hàng/đơn vị</Label>
                                            <Input
                                                id="username"
                                                {...register('username')}
                                                className="bg-gray-50/50 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                                            />
                                            {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email liên hệ</Label>
                                            <Input
                                                id="email"
                                                {...register('email')}
                                                disabled
                                                className="bg-gray-100 text-gray-500 border-gray-200"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phonenumber" className="text-sm font-medium text-gray-700">Số điện thoại</Label>
                                            <Input
                                                id="phonenumber"
                                                {...register('phonenumber')}
                                                className="bg-gray-50/50 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                                                placeholder="Nhập số điện thoại"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button type="submit" disabled={isSaving} className="bg-[#E65E2C] hover:bg-[#d95222] text-white min-w-[120px]">
                                            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {tab === "products" && <ProductsTab products={products} onRefresh={fetchData} />}
                        {tab === "orders" && <OrdersTab orders={orders} onRefresh={fetchData} />}
                        {tab === "rentals" && <RentalCarsTab rentalCars={rentals} onRefresh={fetchData} />}
                        {tab === "repairs" && <RepairsTab repairs={repairs} onRefresh={fetchData} />}

                        {tab === "notifications" && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-6">Thông báo</h2>
                                <div className="py-20 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                                    Bạn không có thông báo mới.
                                </div>
                            </div>
                        )}

                        {tab === "revenue" && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-6">Báo cáo doanh thu</h2>
                                <div className="py-20 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                                    Chưa có dữ liệu doanh thu để hiển thị.
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}
