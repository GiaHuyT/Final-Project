"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import http from "@/lib/http";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newerrors: any = {};

    if (!formData.username.trim())
      newerrors.username = "Username không được để trống";
    else if (formData.username.length < 3)
      newerrors.username = "Username phải có ít nhất 3 ký tự";

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
      newerrors.password = "Mật khẩu phải bao gồm chữ hoa, chữ thường và chữ số";

    if (formData.confirmpassword !== formData.password)
      newerrors.confirmpassword = "Xác nhận mật khẩu không khớp";

    setErrors(newerrors);
    return Object.keys(newerrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const res = await http.post("/auth/register", formData);

      if (res.status === 200 || res.status === 201) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        window.location.href = "/auth/login";
      } else {
        alert(res.data.message || "Đăng ký thất bại");
      }
    } catch (error: any) {
      console.error("Error during register:", error);
      const message = error.response?.data?.message || "Không kết nối được đến server backend";
      alert(message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-2xl overflow-hidden border-none shrink-0 rounded-xl">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-inner">
            <svg
              className="w-8 h-8 text-purple-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold text-white tracking-tight">
            Tạo tài khoản
          </CardTitle>
          <CardDescription className="text-purple-100 mt-2 text-base">
            Đăng ký để bắt đầu trải nghiệm dịch vụ
          </CardDescription>
        </div>

        <CardContent className="p-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                Username
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-600 text-gray-400">
                  <svg
                    className="h-5 w-5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <Input
                  id="username"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className={`pl-10 h-11 transition-all focus-visible:ring-purple-500 ${errors.username ? "border-red-500 ring-red-500/20" : "border-gray-200"
                    }`}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-xs mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-600 text-gray-400">
                  <svg
                    className="h-5 w-5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`pl-10 h-11 transition-all focus-visible:ring-purple-500 ${errors.email ? "border-red-500 ring-red-500/20" : "border-gray-200"
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phonenumber" className="text-sm font-semibold text-gray-700">
                Số điện thoại
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-600 text-gray-400">
                  <svg
                    className="h-5 w-5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <Input
                  id="phonenumber"
                  placeholder="09xx xxx xxx"
                  value={formData.phonenumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phonenumber: e.target.value })
                  }
                  className={`pl-10 h-11 transition-all focus-visible:ring-purple-500 ${errors.phonenumber ? "border-red-500 ring-red-500/20" : "border-gray-200"
                    }`}
                />
              </div>
              {errors.phonenumber && (
                <p className="text-red-500 text-xs mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                  {errors.phonenumber}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Mật khẩu
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-600 text-gray-400">
                  <svg
                    className="h-5 w-5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`pl-10 pr-10 h-11 transition-all focus-visible:ring-purple-500 ${errors.password ? "border-red-500 ring-red-500/20" : "border-gray-200"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmpassword" className="text-sm font-semibold text-gray-700">
                Xác nhận mật khẩu
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-600 text-gray-400">
                  <svg
                    className="h-5 w-5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <Input
                  id="confirmpassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmpassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmpassword: e.target.value })
                  }
                  className={`pl-10 pr-10 h-11 transition-all focus-visible:ring-purple-500 ${errors.confirmpassword ? "border-red-500 ring-red-500/20" : "border-gray-200"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmpassword && (
                <p className="text-red-500 text-xs mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                  {errors.confirmpassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              Đăng ký tài khoản
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 p-8 border-t bg-gray-50/50">
          <div className="text-center w-full">
            <span className="text-gray-500 text-sm">Đã có tài khoản? </span>
            <Link
              href="/auth/login"
              className="text-purple-600 font-bold text-sm hover:text-blue-600 hover:underline transition-all"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
