"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import http from "@/lib/http";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const validateEmail = (email: string) => {
        if (!email.trim()) return "Email không được để trống";
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) return "Email không đúng định dạng";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const err = validateEmail(email);
        if (err) {
            setError(err);
            return;
        }
        setError(null);
        setLoading(true);

        try {
            console.log(email);
            const res = await http.post("/auth/forgot-password", { email });
            const data = res.data;

            toast.success(data.message || "Email reset mật khẩu đã được gửi");
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message || "Không thể kết nối tới server";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center relative font-sans p-6">
            {/* Full Background Image */}
            <div className="absolute inset-0 z-0">
                <img alt="Forgot Password Background" className="w-full h-full object-cover" src="/forgot_bg.png" />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
            </div>

            {/* Centered Box */}
            <div className="w-full max-w-md bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20 z-10">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3 uppercase">Khôi phục <span className="text-blue-600">Đặc quyền</span></h2>
                    <p className="text-slate-500 text-sm font-medium">Nhập email liên kết với tài khoản của bạn để nhận liên kết khôi phục mật khẩu.</p>
                </div>

                {success ? (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Kiểm tra Email</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Chúng tôi đã gửi một liên kết khôi phục mật khẩu đến <span className="font-bold text-slate-900">{email}</span>. Vui lòng kiểm tra hộp thư đến (hoặc thư rác).
                        </p>
                        <Link 
                            href="/auth/login"
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-slate-800 transition-all flex justify-center items-center mt-8 shadow-xl shadow-slate-900/20"
                        >
                            Quay lại Đăng nhập
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Địa chỉ Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-lg group-focus-within:text-blue-600 transition-colors">mail</span>
                                </div>
                                <input 
                                    className={`w-full pl-12 pr-4 py-4 bg-white border-2 rounded-xl text-sm font-bold text-slate-900 transition-all focus:bg-white outline-none shadow-sm ${error ? "border-red-500 focus:border-red-500" : "border-slate-100 focus:border-blue-600"}`}
                                    placeholder="name@example.com" 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 text-xs font-bold pl-1 mt-1">{error}</p>
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
                                    Gửi liên kết
                                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>
                )}

                {!success && (
                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                        <Link className="text-blue-600 font-black text-sm transition-all flex items-center gap-1 group" href="/auth/login">
                            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                            <span className="group-hover:underline underline-offset-4">Quay lại Đăng nhập</span>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
