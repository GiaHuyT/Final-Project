"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import http from "@/lib/http";
import Cookies from "js-cookie";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
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

        try {
            const res = await http.post("/auth/login", { identifier, password });
            const data = res.data;

            if (res.status === 200 || res.status === 201) {
                // alert("Đăng nhập thành công");
                localStorage.setItem("token", data.accessToken);
                Cookies.set("token", data.accessToken);
                localStorage.setItem("user", JSON.stringify(data.user));
                window.location.href = "/";
            } else {
                alert(data.message || "Sai tên đăng nhập hoặc mật khẩu");
            }
        } catch (error: any) {
            console.error("Error during login:", error);
            const message = error.response?.data?.message || "Không kết nối được đến server backend";
            alert(message);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <Card className="w-full max-w-md shadow-2xl overflow-hidden border-none shrink-0 rounded-xl">
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg border border-white/30">
                        <svg
                            className="w-8 h-8 text-white shrink-0"
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
                    <CardTitle className="text-3xl font-bold tracking-tight">Đăng nhập</CardTitle>
                    <CardDescription className="text-blue-100 mt-2 text-base">
                        Chào mừng bạn quay trở lại hệ thống!
                    </CardDescription>
                </div>

                <CardContent className="p-8 pt-6">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Identifier (Email/Phone) */}
                        <div className="space-y-2">
                            <Label htmlFor="identifier" className="text-sm font-semibold text-gray-700">
                                Email hoặc Số điện thoại
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-gray-400">
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
                                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                        />
                                    </svg>
                                </div>
                                <Input
                                    id="identifier"
                                    placeholder="name@example.com hoặc 09xxxxxx"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className={`pl-10 h-11 transition-all focus-visible:ring-blue-500 ${errors.identifier ? "border-red-500 ring-red-500/20" : "border-gray-200"
                                        }`}
                                />
                            </div>
                            {errors.identifier && (
                                <p className="text-red-500 text-xs mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                                    {errors.identifier}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                    Mật khẩu
                                </Label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-gray-400">
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
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`pl-10 h-11 transition-all focus-visible:ring-blue-500 ${errors.password ? "border-red-500 ring-red-500/20" : "border-gray-200"
                                        }`}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98]"
                        >
                            Đăng nhập ngay
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 p-8 border-t bg-gray-50/50">
                    <div className="text-center w-full">
                        <span className="text-gray-500 text-sm">Chưa có tài khoản? </span>
                        <Link
                            href="/auth/register"
                            className="text-blue-600 font-bold text-sm hover:text-purple-600 hover:underline transition-all"
                        >
                            Đăng ký tài khoản
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}