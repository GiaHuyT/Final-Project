"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "react-hot-toast";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const t = searchParams.get("token");
        if (!t) {
            setError("Mã xác nhận không tồn tại hoặc không hợp lệ.");
        } else {
            setToken(t);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword || newPassword.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:3000/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Mật khẩu đã được cập nhật thành công!");
                setTimeout(() => router.push("/auth/login"), 2000);
            } else {
                toast.error(data.message || "Đổi mật khẩu thất bại");
            }
        } catch (err) {
            console.error(err);
            toast.error("Không thể kết nối tới server");
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
                <Card className="w-full max-w-md text-center p-8">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/auth/forgot-password">
                        <Button className="w-full">Quay lại trang Quên mật khẩu</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <Card className="w-full max-w-md shadow-2xl overflow-hidden border-none shrink-0 rounded-xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white">
                    <CardTitle className="text-3xl font-bold tracking-tight">Đặt lại mật khẩu</CardTitle>
                    <CardDescription className="text-blue-100 mt-2 text-base">
                        Nhập mật khẩu mới của bạn bên dưới
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-8 pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password" title="password" className="text-sm font-semibold text-gray-700">
                                Mật khẩu mới
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="h-11 transition-all focus-visible:ring-blue-500 border-gray-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" title="confirmPassword" className="text-sm font-semibold text-gray-700">
                                Xác nhận mật khẩu mới
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-11 transition-all focus-visible:ring-blue-500 border-gray-200"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Đang tải...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
