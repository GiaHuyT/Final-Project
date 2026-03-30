"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import http from "@/lib/http";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const validateForm = () => {
        const newerrors: any = {};

        if (!identifier.trim())
            newerrors.identifier = "Email hoặc số điện thoại không được để trống";
        else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) &&
            !/^\d{9,12}$/.test(identifier)
        )
            newerrors.identifier = "Email hoặc số điện thoại không đúng định dạng";

        if (!password) newerrors.password = "Mật khẩu không được để trống";
        else if (password.length < 6)
            newerrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

        setErrors(newerrors);
        return Object.keys(newerrors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        setIsLoading(true);

        try {
            const res = await http.post("/auth/login", { identifier, password });
            const data = res.data;

            if (res.status === 200 || res.status === 201) {
                localStorage.setItem("token", data.accessToken);
                Cookies.set("token", data.accessToken, { secure: false, sameSite: 'lax' });
                Cookies.set("user_role", data.user.role, { secure: false, sameSite: 'lax' });
                localStorage.setItem("user", JSON.stringify(data.user));
                toast.success("Đăng nhập thành công!");
                setTimeout(() => {
                   window.location.href = "/";
                }, 500);
            } else {
                toast.error(data.message || "Sai tên đăng nhập hoặc mật khẩu");
            }
        } catch (error: any) {
            console.error("Error during login:", error);
            const message = error.response?.data?.message || "Không kết nối được đến máy chủ";
            toast.error(message);
        } finally {
            setIsLoading(false);
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
                <div className="absolute top-12 left-12">
                    <Link href="/" className="text-3xl font-black tracking-tighter text-white">AutoBid</Link>
                </div>
                <div className="absolute bottom-20 left-12 max-w-xl text-white z-10">
                    <h1 className="text-6xl font-extrabold tracking-tighter leading-[0.9] mb-6 uppercase">
                        Khai mở kỷ nguyên <br /> <span className="italic font-light text-blue-500">Siêu xe.</span>
                    </h1>
                    <p className="text-xl text-white/80 font-medium leading-relaxed mb-8">
                        Truy cập sàn đấu giá hiệu suất cao và danh mục tài sản chọn lọc. Trải nghiệm hệ sinh thái sở hữu xe thế hệ mới.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-800" />
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-700" />
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-600" />
                        </div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/60 font-bold">
                            Cùng 12,000+ Nhà Sưu Tầm
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side login */}
            <div className="w-full lg:w-2/5 flex flex-col justify-center items-center px-6 md:px-12 py-24 bg-white relative">
                {/* Mobile Background Image */}
                <div className="lg:hidden absolute inset-0 z-0">
                    <img alt="Porsche" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2669&auto=format&fit=crop" />
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
                </div>

                <div className="w-full max-w-md bg-white/90 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none p-8 md:p-12 rounded-3xl lg:rounded-none shadow-2xl lg:shadow-none border border-white/20 lg:border-none z-10">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Đăng nhập</h2>
                        <p className="text-slate-500 text-sm font-medium">Nhập thông tin xác thực để kết nối vào hệ thống.</p>
                    </div>

                    {/* Social Logins */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button type="button" onClick={() => toast("Chức năng đang phát triển")} className="flex items-center justify-center gap-3 py-3.5 border border-slate-200 hover:bg-slate-50 transition-colors rounded-xl text-sm font-bold text-slate-700">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button type="button" onClick={() => toast("Chức năng đang phát triển")} className="flex items-center justify-center gap-3 py-3.5 border border-slate-200 hover:bg-slate-50 transition-colors rounded-xl text-sm font-bold text-slate-700">
                            <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                            Apple
                        </button>
                    </div>

                    <div className="relative flex items-center gap-4 mb-8">
                        <div className="flex-grow h-[1px] bg-slate-200"></div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Hoặc dùng tài khoản</span>
                        <div className="flex-grow h-[1px] bg-slate-200"></div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Định danh (Email / Điện thoại)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-lg group-focus-within:text-blue-600 transition-colors">mail</span>
                                </div>
                                <input 
                                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-xl text-sm font-bold text-slate-900 transition-all focus:bg-white outline-none ${errors.identifier ? "border-red-500 focus:border-red-500" : "border-transparent focus:border-blue-600"}`}
                                    placeholder="name@example.com hoặc 09xxxxxx" 
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>
                            {errors.identifier && (
                                <p className="text-red-500 text-xs font-bold pl-1 mt-1">{errors.identifier}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Mật khẩu</label>
                                <Link 
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700 hover:underline transition-all" 
                                    href="/auth/forgot-password"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-lg group-focus-within:text-blue-600 transition-colors">lock</span>
                                </div>
                                <input 
                                    className={`w-full pl-12 pr-12 py-4 bg-slate-50 border-2 rounded-xl text-sm font-bold text-slate-900 transition-all focus:bg-white outline-none ${errors.password ? "border-red-500 focus:border-red-500" : "border-transparent focus:border-blue-600"}`}
                                    placeholder="••••••••" 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                        <div className="flex items-center gap-3 py-2 pl-1">
                            <input className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-600/20 transition-all" id="remember" type="checkbox" />
                            <label className="text-xs text-slate-500 font-bold cursor-pointer" htmlFor="remember">Duy trì đăng nhập trong 30 ngày</label>
                        </div>

                        <button 
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/20 flex justify-center items-center gap-2" 
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Vào hệ thống
                                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Chưa phải là thành viên AutoBid? 
                            <Link className="text-blue-600 font-black hover:underline underline-offset-4 ml-1 block mt-2 text-base transition-all" href="/auth/register">
                                Khởi tạo tài khoản
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}