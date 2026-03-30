"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import http from "@/lib/http";
import { toast } from "react-hot-toast";
import { Loader2, Car, Gavel, Bell, User, ArrowRight, Store, ShieldCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRegModalOpen, setIsRegModalOpen] = useState(false);
    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
    const [pendingRole, setPendingRole] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, productsRes] = await Promise.all([
                    http.get('/users/profile'),
                    // Just an example endpoint: adjust based on user role if needed
                    http.get('/products/vendor/me').catch(() => ({ data: [] }))
                ]);
                setUser(profileRes.data);
                setProducts(productsRes.data || []);
            } catch (error) {
                console.error("Error fetching profile data:", error);
                toast.error("Không thể tải thông tin hồ sơ");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        );
    }

    // Determine membership phrasing based on role
    const getRoleName = (role: string) => {
        if (role === 'ADMIN') return 'Quản Trị Hệ Thống';
        if (role === 'VENDOR') return 'Nhà Cung Cấp Xác Minh';
        return 'Thành Viên Cơ Bản';
    };

    const getMembershipTier = (role: string) => {
        if (role === 'ADMIN') return 'Quyền Hành Cao Nhất';
        if (role === 'VENDOR') return 'Hạng Thương Gia';
        return 'Hạng Phổ Thông';
    };

    const getRoleDescription = (role: string) => {
        if (role === 'ADMIN') return 'Bạn có toàn quyền truy cập và quản lý mọi dữ liệu trên hệ thống AutoBid.';
        if (role === 'VENDOR') return 'Chào mừng đối tác, bạn có thể niêm yết xe và quản lý giao dịch đấu giá.';
        return 'Bạn có thể thêm vào yêu thích và đặt giá thầu cho mọi chiếc xe trên nền tảng.';
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-20">
            <main className="pt-24 pb-16 px-6 lg:px-12 max-w-[1400px] mx-auto">
                {/* Header Section */}
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 mb-2">Gara của tôi</h1>
                    <p className="text-slate-500 font-medium text-lg">Quản lý hồ sơ, danh sách xe yêu thích và các cài đặt chung.</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
                            <button className="flex items-center gap-3 px-5 py-4 text-blue-600 border-b-2 lg:border-b-0 lg:border-l-4 border-blue-600 bg-blue-50/50 transition-all whitespace-nowrap rounded-r-xl">
                                <User className="w-5 h-5 flex-shrink-0" />
                                <span className="font-bold text-sm tracking-wide">Hồ sơ cá nhân</span>
                            </button>
                            <Link href="/wishlist" className="flex items-center gap-3 px-5 py-4 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-4 border-transparent rounded-r-xl">
                                <Car className="w-5 h-5 flex-shrink-0" />
                                <span className="font-bold text-sm tracking-wide">Xe yêu thích</span>
                            </Link>
                            <button className="flex items-center gap-3 px-5 py-4 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-4 border-transparent rounded-r-xl">
                                <Gavel className="w-5 h-5 flex-shrink-0" />
                                <span className="font-bold text-sm tracking-wide">Lịch sử đấu giá</span>
                            </button>
                            <button className="flex items-center gap-3 px-5 py-4 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-4 border-transparent rounded-r-xl">
                                <Bell className="w-5 h-5 flex-shrink-0" />
                                <span className="font-bold text-sm tracking-wide">Thông báo</span>
                            </button>
                        </nav>

                        {/* Vendor Account Button (as per user image) */}
                        <div className="mt-6 px-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    if (!user) return;

                                    if (user.isApprovedVendor) {
                                        setPendingRole(user.role === 'VENDOR' ? 'CUSTOMER' : 'VENDOR');
                                        setIsSwitchModalOpen(true);
                                    } else if (user.vendorRequestPending) {
                                        toast.error("Yêu cầu của bạn đang được xử lý.");
                                    } else {
                                        setIsRegModalOpen(true);
                                    }
                                }}
                                className={cn(
                                    "w-full py-4 px-4 rounded-2xl border flex items-center justify-between transition-all font-bold text-[13px] group shadow-sm",
                                    user?.role === 'VENDOR'
                                        ? "bg-slate-900 text-white border-slate-900 hover:bg-black"
                                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-900 active:scale-[0.98]"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                        user?.role === 'VENDOR' ? "bg-white/10" : "bg-slate-100 group-hover:bg-slate-900 group-hover:text-white"
                                    )}>
                                        <Store className="w-4 h-4" />
                                    </div>
                                    <span>
                                        {user?.isApprovedVendor 
                                            ? (user?.role === 'VENDOR' ? 'Chế độ Người bán' : 'Tài khoản nhà cung cấp') 
                                            : (user?.vendorRequestPending ? 'Đang chờ phê duyệt' : 'Tài khoản nhà cung cấp')
                                        }
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                            </button>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-grow space-y-10">
                        {/* Registration Modal */}
                        <Dialog open={isRegModalOpen} onOpenChange={setIsRegModalOpen}>
                            <DialogContent className="sm:max-w-[460px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                                <div className="bg-gradient-to-br from-[#404040] to-[#171717] p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                                    <Store className="w-12 h-12 mb-4 relative z-10 opacity-90" />
                                    <h2 className="text-2xl font-black mb-2 relative z-10">Đăng ký Nhà cung cấp</h2>
                                    <p className="text-neutral-400 font-medium relative z-10">Bắt đầu kinh doanh xe chuyên nghiệp trên hệ thống AutoBid ngay hôm nay.</p>
                                </div>
                                <div className="p-8 space-y-6 bg-white">
                                    <div className="space-y-4">
                                        {[
                                            { icon: ShieldCheck, text: "Đăng bán xe không giới hạn", sub: "Tiếp cận hàng ngàn khách hàng tiềm năng." },
                                            { icon: Gavel, text: "Tạo và quản lý phiên đấu giá", sub: "Hệ thống đấu giá thời gian thực minh bạch." },
                                            { icon: Bell, text: "Hỗ trợ quảng bá sản phẩm", sub: "Nhận thông báo đơn hàng và báo cáo chi tiết." }
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-4 items-start">
                                                <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-900 border border-neutral-100 shrink-0 shadow-sm">
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-neutral-800 leading-tight">{item.text}</p>
                                                    <p className="text-xs text-neutral-500 font-medium mt-0.5">{item.sub}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 flex flex-col gap-3">
                                        <Button 
                                            onClick={async () => {
                                                try {
                                                    await http.post('/users/apply-vendor');
                                                    toast.success('Gửi yêu cầu thành công!');
                                                    setIsRegModalOpen(false);
                                                    setTimeout(() => window.location.reload(), 800);
                                                } catch (err: any) {
                                                    toast.error(err.response?.data?.message || 'Lỗi khi gửi yêu cầu');
                                                }
                                            }}
                                            className="w-full bg-[#171717] hover:bg-black text-white h-14 rounded-2xl font-black text-sm uppercase tracking-wider transition-all hover:shadow-xl hover:scale-[1.01]"
                                        >
                                            Xác nhận đăng ký ngay
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => setIsRegModalOpen(false)}
                                            className="w-full h-12 rounded-xl font-bold text-neutral-400 hover:text-neutral-600"
                                        >
                                            Để sau
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Switch Role Modal */}
                        <Dialog open={isSwitchModalOpen} onOpenChange={setIsSwitchModalOpen}>
                            <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-8 text-center border-none shadow-2xl">
                                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <User className="w-10 h-10" />
                                </div>
                                <DialogTitle className="text-2xl font-black text-slate-900 mb-2">Chuyển đổi vai trò</DialogTitle>
                                <DialogDescription className="text-slate-500 font-medium mb-8">
                                    Bạn có chắc chắn muốn chuyển sang tài khoản **{pendingRole === 'VENDOR' ? 'Nhà cung cấp' : 'Người mua'}** không? 
                                    Giao diện sẽ được cập nhật tương ứng.
                                </DialogDescription>
                                <div className="flex flex-col gap-3">
                                    <Button 
                                        onClick={async () => {
                                            try {
                                                const { data: updatedUser } = await http.patch('/users/switch-role', { role: pendingRole });
                                                localStorage.setItem('user', JSON.stringify(updatedUser));
                                                toast.success('Chuyển đổi thành công!');
                                                setIsSwitchModalOpen(false);
                                                setTimeout(() => window.location.reload(), 500);
                                            } catch (err: any) {
                                                toast.error(err.response?.data?.message || 'Lỗi khi chuyển đổi');
                                            }
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-600/20"
                                    >
                                        Xác nhận chuyển đổi
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setIsSwitchModalOpen(false)}
                                        className="w-full h-12 rounded-xl font-bold text-slate-400"
                                    >
                                        Hủy bỏ
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Personal Info Bento Section */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Profile Card */}
                            <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none"></div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Thông tin Cá nhân</h2>
                                    <button className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors w-fit">
                                        Chỉnh sửa hồ sơ
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Họ và tên hoặc Tổ chức</label>
                                        <p className="text-xl font-bold text-slate-900">{user?.username || "—"}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Địa chỉ Email</label>
                                        <p className="text-xl font-bold text-slate-900">{user?.email || "—"}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Số điện thoại</label>
                                        <p className="text-xl font-bold text-slate-900">{user?.phonenumber || "—"}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Đăng ký ngày</label>
                                        <p className="text-xl font-bold text-slate-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "—"}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Membership Status */}
                            <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl shadow-slate-900/10 relative overflow-hidden">
                                <div className="absolute -right-10 -bottom-10 opacity-10">
                                    <span className="material-symbols-outlined text-9xl">workspace_premium</span>
                                </div>
                                <div className="relative z-10">
                                    <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white mb-6 backdrop-blur-md">
                                        {getMembershipTier(user?.role)}
                                    </span>
                                    <h3 className="text-3xl font-black tracking-tight leading-tight mb-3">
                                        {getRoleName(user?.role)}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                        {getRoleDescription(user?.role)}
                                    </p>
                                </div>
                                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-white cursor-pointer hover:text-blue-300 transition-colors w-max relative z-10">
                                    Chi tiết đặc quyền <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </section>

                        {/* Recently Viewed / Saved Cars */}
                        <section className="space-y-6">
                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 border-b border-slate-200 pb-4">Danh sách yêu thích</h2>
                            {products.length === 0 ? (
                                <div className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 min-h-[300px]">
                                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                                        <Car className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Chưa có xe nào trong gara</h3>
                                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-sm">Duyệt qua danh mục xe thể thao hiện tại và lưu những chiếc bạn quan tâm.</p>
                                    <Link href="/auctions" className="px-8 py-4 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                        Khám phá sàn giao dịch
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all cursor-pointer flex flex-col">
                                            <Link href={`/products/${product.id}`} className="block flex-1">
                                                <div className="h-56 relative overflow-hidden bg-slate-100">
                                                    <img alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={product.imageUrl || "/images/static/car-placeholder.png"} />
                                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-red-500 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <div className="flex justify-between items-start gap-4 mb-3">
                                                        <h3 className="font-extrabold text-lg text-slate-900 line-clamp-2 leading-tight">{product.name}</h3>
                                                    </div>
                                                    <p className="text-2xl font-black text-blue-600 mb-4">{product.price.toLocaleString()} <span className="text-[12px] align-top text-blue-400">đ</span></p>
                                                    
                                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                                        <div className="bg-slate-50 rounded-lg p-2.5 flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-slate-400 text-sm">directions_car</span>
                                                            <span className="text-xs font-bold text-slate-700">{product.brand || 'Xe'}</span>
                                                        </div>
                                                        <div className="bg-slate-50 rounded-lg p-2.5 flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-slate-400 text-sm">speed</span>
                                                            <span className="text-xs font-bold text-slate-700">{product.mileage ? `${product.mileage} km` : 'Mới'}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                                                        <div className="h-full bg-emerald-500 w-full"></div>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Trạng thái: Tài sản hợp lệ</p>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 group hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer">
                                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                            <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors">add</span>
                                        </div>
                                        <h3 className="font-bold text-sm text-slate-900 mb-2">Thêm xe yêu thích mới</h3>
                                        <p className="text-xs font-medium text-slate-500">Mở rộng danh sách những chiếc xe bạn đang quan tâm.</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}