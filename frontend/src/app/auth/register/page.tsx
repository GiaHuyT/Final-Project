"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import http from "@/lib/http";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phonenumber: "",
        password: "",
        confirmpassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const validateForm = () => {
        const newerrors: any = {};

        if (!formData.username.trim())
            newerrors.username = "Họ tên không được để trống";
        else if (formData.username.length < 3)
            newerrors.username = "Họ tên phải có ít nhất 3 ký tự";

        if (!formData.email.trim()) newerrors.email = "Email không được để trống";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newerrors.email = "Email không đúng định dạng";

        if (!formData.phonenumber.trim())
            newerrors.phonenumber = "Số điện thoại không được để trống";
        else if (!/^\d{9,12}$/.test(formData.phonenumber))
            newerrors.phonenumber = "Số điện thoại phải gồm 9–12 chữ số";

        if (!formData.password) newerrors.password = "Mật khẩu không được để trống";
        else if (formData.password.length < 6)
            newerrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
            newerrors.password = "Mật khẩu phải bao gồm KH, KT và số";

        if (formData.confirmpassword !== formData.password)
            newerrors.confirmpassword = "Xác nhận mật khẩu không khớp";

        if (!agreed) {
            newerrors.agreed = "Bạn phải đồng ý với Điều khoản dịch vụ";
        }

        setErrors(newerrors);
        return Object.keys(newerrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            if (errors.agreed && Object.keys(errors).length === 1) {
                toast.error(errors.agreed);
            }
            return;
        }

        setIsLoading(true);

        try {
            const res = await http.post("/auth/register", formData);

            if (res.status === 200 || res.status === 201) {
                toast.success("Khởi tạo thành công! Đang chuyển hướng đăng nhập...");
                setTimeout(() => {
                    window.location.href = "/auth/login";
                }, 1500);
            } else {
                toast.error(res.data.message || "Đăng ký thất bại");
                setIsLoading(false);
            }
        } catch (error: any) {
            console.error("Error during register:", error);
            const message = error.response?.data?.message || "Không kết nối được đến máy chủ";
            toast.error(message);
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen pt-16 flex items-center justify-center lg:justify-start overflow-hidden relative font-sans">
            {/* Background Asset for Premium Feel */}
            <div className="absolute inset-0 z-0 hidden lg:block">
                <div className="h-full w-full bg-surface-dim opacity-10"></div>
                <img 
                    className="absolute right-0 top-0 h-full w-[70%] xl:w-[75%] object-cover object-center clip-path-slant" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmCv-nClBz2uE3dnKOksSAo6lXhIKlrhpuvFge5UuX-8eCsYWOEN8SAOJP-hq_109sCuVLUTtKOZj2yeiyNASEgEZKaK1K61RwLsPLlBaaX9Nbj7_6t6jBtShX2ALgvxHvyHxDYEbqrkZvh86vFJAkco6EEc5xuxWGe_KlKY6G1-AwXuSkpzucp36zNOR9vbsHdXutoqTlz7X2pRd5S3z3bYFomYfC9RVNtTilrb3MakOL7bjMF8GXjgaF-63GE4Ci6VB9dBRG5l7S" 
                    style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)' }} 
                    alt="Close-up of a high-performance luxury sports car"
                />
            </div>

            {/* Registration Container */}
            <div className="relative z-10 w-full max-w-2xl px-6 lg:pl-24 lg:pr-0">
                <div className="bg-surface-container-lowest lg:bg-transparent p-8 lg:p-0 rounded-xl lg:rounded-none">
                    <div className="mb-10">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-3 block">Khởi động hành trình</span>
                        <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface mb-4">Tạo Tài Khoản</h1>
                        <p className="text-on-surface-variant max-w-md font-body leading-relaxed">
                            Gia nhập giới tinh hoa sưu tầm xe thể thao. Quyền tiếp cận độc quyền đến các phiên đấu giá cao cấp và công cụ trả giá thông minh.
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                        {/* Name Field */}
                        <div className="group">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Họ và tên</label>
                            <div className="relative flex items-center">
                                <div className="absolute left-0 h-full w-1 bg-primary scale-y-0 group-focus-within:scale-y-100 transition-transform duration-300"></div>
                                <input 
                                    className={`w-full bg-surface-container-low border-none focus:ring-0 focus:bg-surface-container-highest px-6 py-4 rounded-lg text-on-surface placeholder:text-outline transition-colors font-body ${errors.username ? 'outline outline-1 outline-error' : ''}`}
                                    placeholder="Alex Sterling" 
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            {errors.username && <p className="text-error text-xs font-semibold pl-1 mt-1">{errors.username}</p>}
                        </div>

                        {/* Email Field */}
                        <div className="group">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Địa chỉ Email</label>
                            <div className="relative flex items-center">
                                <div className="absolute left-0 h-full w-1 bg-primary scale-y-0 group-focus-within:scale-y-100 transition-transform duration-300"></div>
                                <input 
                                    className={`w-full bg-surface-container-low border-none focus:ring-0 focus:bg-surface-container-highest px-6 py-4 rounded-lg text-on-surface placeholder:text-outline transition-colors font-body ${errors.email ? 'outline outline-1 outline-error' : ''}`}
                                    placeholder="alex@precision.com" 
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            {errors.email && <p className="text-error text-xs font-semibold pl-1 mt-1">{errors.email}</p>}
                        </div>

                        {/* Phone Field (Added missing field) */}
                        <div className="group">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Số điện thoại</label>
                            <div className="relative flex items-center">
                                <div className="absolute left-0 h-full w-1 bg-primary scale-y-0 group-focus-within:scale-y-100 transition-transform duration-300"></div>
                                <input 
                                    className={`w-full bg-surface-container-low border-none focus:ring-0 focus:bg-surface-container-highest px-6 py-4 rounded-lg text-on-surface placeholder:text-outline transition-colors font-body ${errors.phonenumber ? 'outline outline-1 outline-error' : ''}`}
                                    placeholder="09xx xxx xxx" 
                                    type="tel"
                                    value={formData.phonenumber}
                                    onChange={(e) => setFormData({ ...formData, phonenumber: e.target.value })}
                                />
                            </div>
                            {errors.phonenumber && <p className="text-error text-xs font-semibold pl-1 mt-1">{errors.phonenumber}</p>}
                        </div>

                        {/* Password Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Mật khẩu</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-0 h-full w-1 bg-primary scale-y-0 group-focus-within:scale-y-100 transition-transform duration-300 z-10"></div>
                                    <input 
                                        className={`w-full bg-surface-container-low border-none focus:ring-0 focus:bg-surface-container-highest px-6 pr-12 py-4 rounded-lg text-on-surface placeholder:text-outline transition-colors font-body ${errors.password ? 'outline outline-1 outline-error' : ''}`}
                                        placeholder="••••••••" 
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 text-on-surface-variant hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-error text-xs font-semibold pl-1 mt-1">{errors.password}</p>}
                            </div>

                            <div className="group">
                                <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Xác nhận mật khẩu</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-0 h-full w-1 bg-primary scale-y-0 group-focus-within:scale-y-100 transition-transform duration-300 z-10"></div>
                                    <input 
                                        className={`w-full bg-surface-container-low border-none focus:ring-0 focus:bg-surface-container-highest px-6 pr-12 py-4 rounded-lg text-on-surface placeholder:text-outline transition-colors font-body ${errors.confirmpassword ? 'outline outline-1 outline-error' : ''}`}
                                        placeholder="••••••••" 
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmpassword}
                                        onChange={(e) => setFormData({ ...formData, confirmpassword: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 text-on-surface-variant hover:text-primary transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.confirmpassword && <p className="text-error text-xs font-semibold pl-1 mt-1">{errors.confirmpassword}</p>}
                            </div>
                        </div>

                        {/* Terms Agreement */}
                        <div className="flex items-center gap-3 pt-2">
                            <label className="relative flex items-center cursor-pointer">
                                <input 
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-outline-variant bg-surface-container-low transition-all checked:bg-primary focus:ring-0 focus:ring-offset-0" 
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                />
                                <span className="material-symbols-outlined absolute text-white opacity-0 peer-checked:opacity-100 text-sm left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">check</span>
                            </label>
                            <span className="text-sm text-on-surface-variant font-body">
                                Tôi đồng ý với <Link className="text-primary font-semibold hover:underline decoration-2 underline-offset-4" href="#">Điều khoản dịch vụ</Link> và Chính sách bảo mật
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 space-y-6">
                            <button 
                                className="w-full md:w-auto px-12 py-5 bg-primary text-on-primary rounded-full font-bold tracking-tight text-lg hover:shadow-xl hover:shadow-primary/10 active:scale-95 transition-all flex items-center justify-center gap-3" 
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Tạo Tài Khoản
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </>
                                )}
                            </button>
                            <p className="text-on-surface-variant text-sm font-medium">
                                Đã có tài khoản? 
                                <Link className="text-primary font-bold hover:underline decoration-2 underline-offset-4 ml-1 transition-all" href="/auth/login">Đăng nhập</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
