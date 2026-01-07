"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
            const res = await fetch("http://localhost:3000/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "Email reset mật khẩu đã được gửi");
                setEmail("");
            } else {
                const errorMsg = data.message || "Gửi email thất bại";
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (err) {
            console.error(err);
            const errorMsg = "Không thể kết nối tới server";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <Card className="w-full max-w-md shadow-2xl overflow-hidden border-none shrink-0 rounded-xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white">
                    <CardTitle className="text-3xl font-bold tracking-tight">Quên mật khẩu</CardTitle>
                    <CardDescription className="text-blue-100 mt-2 text-base">
                        Nhập email để nhận link reset mật khẩu
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-8 pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="abc@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`h-11 transition-all focus-visible:ring-blue-500 ${error ? "border-red-500 ring-red-500/20" : "border-gray-200"}`}
                            />
                            {error && (
                                <p className="text-red-500 text-xs mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                                    {error}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? "Đang gửi..." : "Gửi email"}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 p-8 border-t bg-gray-50/50 text-center">
                    <Link
                        href="/auth/login"
                        className="text-blue-600 font-bold text-sm hover:text-purple-600 hover:underline transition-all"
                    >
                        Quay lại đăng nhập
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
