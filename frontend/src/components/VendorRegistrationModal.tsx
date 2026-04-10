"use client";
import React from "react";
import { Store, ShieldCheck, Gavel, Bell } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import http from "@/lib/http";
import { useRouter } from "next/navigation";

interface VendorRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function VendorRegistrationModal({ isOpen, onClose, onSuccess }: VendorRegistrationModalProps) {
    const router = useRouter();

    const handleApply = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Vui lòng đăng nhập trước khi đăng ký.');
                router.push('/login');
                return;
            }
            await http.post('/users/apply-vendor');
            toast.success('Gửi yêu cầu thành công!');
            onClose();
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Lỗi khi gửi yêu cầu');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[460px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-br from-[#404040] to-[#171717] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                    <Store className="w-12 h-12 mb-4 relative z-10 opacity-90" />
                    <h2 className="text-2xl font-black mb-2 relative z-10">Đăng ký Nhà cung cấp</h2>
                    <p className="text-neutral-400 font-medium relative z-10">Bắt đầu kinh doanh xe chuyên nghiệp trên hệ thống AutoBid ngay hôm nay.</p>
                </div>
                <div className="p-8 space-y-6 bg-white">
                    <div className="space-y-4">
                        {[
                            { icon: ShieldCheck, text: "Đăng bán xe không giới hạn", sub: "Tiếp cận hàng ngàn khách hàng tiềm năng." },
                            { icon: Gavel, text: "Tạo và quản lý phiên đấu giá", sub: "Hệ thống đấu giá thời gian thực minh bạch." },
                            { icon: Bell, text: "Hỗ trợ quảng bá sản phẩm", sub: "Nhận thông báo đơn hàng và báo cáo chi tiết." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-900 border border-neutral-100 shrink-0 shadow-sm">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-800 leading-tight">{item.text}</p>
                                    <p className="text-xs text-neutral-500 font-medium mt-0.5">{item.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 flex flex-col gap-3">
                        <Button 
                            onClick={handleApply}
                            className="w-full bg-[#171717] hover:bg-black text-white h-14 rounded-2xl font-black text-sm uppercase tracking-wider transition-all hover:shadow-xl hover:scale-[1.01]"
                        >
                            Xác nhận đăng ký ngay
                        </Button>
                        <Button 
                            variant="ghost" 
                            onClick={onClose}
                            className="w-full h-12 rounded-xl font-bold text-neutral-400 hover:text-neutral-600"
                        >
                            Để sau
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
