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
                        Khôi phục <br /> <span className="italic font-light text-blue-500">Đặc quyền.</span>
                    </h1>
                    <p className="text-xl text-white/80 font-medium leading-relaxed mb-8">
                        Lấy lại quyền truy cập vào hệ sinh thái di chuyển cao cấp. Mọi thông tin của bạn luôn được bảo mật tuyệt đối.
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
                        <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Quên mật khẩu</h2>
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
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-slate-800 transition-all flex justify-center items-center mt-8"
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
                                        className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-xl text-sm font-bold text-slate-900 transition-all focus:bg-white outline-none ${error ? "border-red-500 focus:border-red-500" : "border-transparent focus:border-blue-600"}`}
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
                        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                            <Link className="text-blue-600 font-black hover:underline underline-offset-4 text-sm transition-all" href="/auth/login">
                                <span className="material-symbols-outlined align-middle mr-1 text-sm">arrow_back</span>
                                Quay lại Đăng nhập
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
