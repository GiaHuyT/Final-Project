"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import http from "@/lib/http";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<any>({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const t = searchParams.get("token");
        if (!t) {
            setError("Liên kết khôi phục không hợp lệ hoặc đã hết hạn.");
        } else {
            setToken(t);
        }
    }, [searchParams]);

    const validateForm = () => {
        const newerrors: any = {};

        if (!newPassword) newerrors.password = "Mật khẩu mới không được để trống";
        else if (newPassword.length < 6)
            newerrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword))
            newerrors.password = "Mật khẩu phải bao gồm chữ hoa, chữ thường và chữ số";

        if (newPassword !== confirmPassword) {
            newerrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setErrors(newerrors);
        return Object.keys(newerrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const res = await http.post("/auth/reset-password", { token, newPassword });

            toast.success("Mật khẩu đã được cập nhật thành công!");
            setSuccess(true);
            setTimeout(() => router.push("/auth/login"), 3000);
        } catch (err: any) {
            console.error(err);
            const message = err.response?.data?.message || "Không thể kết nối tới server";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
                <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-red-600 text-3xl">error</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">Lỗi Xác Trực</h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
                    <Link 
                        href="/auth/forgot-password"
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-slate-800 transition-all flex justify-center items-center"
                    >
                        Quay lại Quên Mật Khẩu
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex relative bg-slate-50 font-sans">
            {/* Split Layout - Left side background */}
            <div className="hidden lg:block lg:w-3/5 relative h-screen sticky top-0">
                <img 
                    alt="Sleek Porsche in a dark modern garage" 
                    className="absolute inset-0 w-full h-full object-cover" 
                    src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2669&auto=format&fit=crop" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20"></div>
                <div className="absolute bottom-20 left-12 max-w-xl text-white z-10">
                    <h1 className="text-6xl font-extrabold tracking-tighter leading-[0.9] mb-6 uppercase">
                        Khởi động <br /> <span className="italic font-light text-blue-500">Hành trình mới.</span>
                    </h1>
                    <p className="text-xl text-white/80 font-medium leading-relaxed mb-8">
                        Thiết lập lại lớp bảo mật để tiếp tục trải nghiệm các dịch vụ đặc quyền của AutoBid.
                    </p>
                </div>
            </div>

            {/* Right side form */}
            <div className="w-full lg:w-2/5 flex flex-col justify-center items-center px-6 md:px-12 py-24 bg-white relative">
                {/* Mobile Background Image */}
                <div className="lg:hidden absolute inset-0 z-0">
                    <img alt="Porsche" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2669&auto=format&fit=crop" />
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
                </div>

                <div className="w-full max-w-md bg-white/90 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none p-8 md:p-12 rounded-3xl lg:rounded-none shadow-2xl lg:shadow-none border border-white/20 lg:border-none z-10">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Tạo Mật Khẩu</h2>
                        <p className="text-slate-500 text-sm font-medium">Thiết lập mật khẩu mới để bảo vệ tài khoản của bạn.</p>
                    </div>

                    {success ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Thành Công!</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                Mật khẩu của bạn đã được cập nhật thành công. Đang tự động chuyển hướng đến trang Đăng nhập...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Mật khẩu mới</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 text-lg group-focus-within:text-blue-600 transition-colors">lock</span>
                                    </div>
                                    <input 
                                        className={`w-full pl-12 pr-12 py-4 bg-slate-50 border-2 rounded-xl text-sm font-bold text-slate-900 transition-all focus:bg-white outline-none [&::-ms-reveal]:hidden [&::-webkit-reveal]:hidden ${errors.password ? "border-red-500 focus:border-red-500" : "border-transparent focus:border-blue-600"}`}
                                        placeholder="••••••••" 
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs font-bold pl-1 mt-1">{errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Xác nhận mật khẩu</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 text-lg group-focus-within:text-blue-600 transition-colors">lock</span>
                                    </div>
                                    <input 
                                        className={`w-full pl-12 pr-12 py-4 bg-slate-50 border-2 rounded-xl text-sm font-bold text-slate-900 transition-all focus:bg-white outline-none [&::-ms-reveal]:hidden [&::-webkit-reveal]:hidden ${errors.confirmPassword ? "border-red-500 focus:border-red-500" : "border-transparent focus:border-blue-600"}`}
                                        placeholder="••••••••" 
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-xs font-bold pl-1 mt-1">{errors.confirmPassword}</p>
                                )}
                            </div>

                            <button 
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/20 flex justify-center items-center gap-2" 
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Lưu Mật Khẩu
                                        <span className="material-symbols-outlined text-base">check</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
