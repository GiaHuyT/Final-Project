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
        <main className="min-h-screen flex items-center justify-center relative font-sans p-6">
            {/* Hình nền đầy đủ */}
            <div className="absolute inset-0 z-0">
                <img alt="Reset Password Background" className="w-full h-full object-cover" src="/reset_bg.png" />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
            </div>

            {/* Hộp ở giữa */}
            <div className="w-full max-w-md bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20 z-10">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3 uppercase">Khởi động <span className="text-blue-600">Hành trình</span></h2>
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
                                    className={`w-full pl-12 pr-12 py-4 bg-white border-2 rounded-xl text-sm font-bold text-slate-900 transition-all focus:bg-white outline-none shadow-sm [&::-ms-reveal]:hidden [&::-webkit-reveal]:hidden ${errors.password ? "border-red-500 focus:border-red-500" : "border-slate-100 focus:border-blue-600"}`}
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
                                    className={`w-full pl-12 pr-12 py-4 bg-white border-2 rounded-xl text-sm font-bold text-slate-900 transition-all focus:bg-white outline-none shadow-sm [&::-ms-reveal]:hidden [&::-webkit-reveal]:hidden ${errors.confirmPassword ? "border-red-500 focus:border-red-500" : "border-slate-100 focus:border-blue-600"}`}
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
