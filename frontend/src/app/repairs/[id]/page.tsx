"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ChevronRight, MapPin, Phone, ShieldCheck,
    Settings, ChevronLeft, Building2, UserCircle2, Car, MessageSquare, Mail
} from "lucide-react";
import http from "@/lib/http";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function RepairDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await http.get(`/repairs/capacity/public/${id}`);
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch repair capacity", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen pt-24 pb-12 flex justify-center items-center"><div className="animate-pulse flex items-center gap-2"><Settings className="w-6 h-6 animate-spin text-primary" /> <span>Đang tải...</span></div></div>;
    }

    if (!data) {
        return <div className="min-h-screen pt-24 pb-12 text-center text-slate-500">Không tìm thấy thông tin sửa chữa</div>;
    }

    // Gather all images (imageUrl and whatever in imageUrls)
    const images: string[] = [];
    if (data.imageUrl) images.push(data.imageUrl);
    if (data.imageUrls && Array.isArray(data.imageUrls)) {
        data.imageUrls.forEach((url: string) => {
            if (url && url !== data.imageUrl) images.push(url);
        });
    }

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const Specialties = data.specialty?.split(',') || ["..."];
    const VehicleTypes = data.vehicleTypes?.split(',') || [];

    return (
        <div className="bg-slate-50 text-slate-900 font-body min-h-screen pt-16">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <nav className="flex text-sm text-slate-500 mb-8 items-center gap-1 flex-wrap">
                    <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                    <ChevronRight className="w-4 h-4 mx-1" />
                    <Link href="/repairs" className="hover:text-primary transition-colors">Dịch vụ sửa chữa</Link>
                    <ChevronRight className="w-4 h-4 mx-1" />
                    <span className="text-slate-800 font-medium">{data.name}</span>
                </nav>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* Left: Image Gallery */}
                    <div className="w-full lg:w-[45%] flex flex-col gap-4">
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
                            {images.length > 0 ? (
                                <img
                                    src={images[currentImageIndex]}
                                    alt={data.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Car className="w-24 h-24 text-slate-300" />
                            )}
                            {images.length > 1 && (
                                <>
                                    <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex justify-center items-center hover:bg-black/60 transition-colors backdrop-blur-sm z-10">
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex justify-center items-center hover:bg-black/60 transition-colors backdrop-blur-sm z-10">
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {images.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Details Info */}
                    <div className="w-full lg:w-[55%] flex flex-col gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-3">{data.name}</h1>
                            <p className="text-slate-500 leading-relaxed min-h-[4rem]">{data.description || "Đang tải thông tin mô tả..."}</p>
                        </div>

                        {/* Vendor Call To Action */}
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-white shadow-sm group">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border border-slate-100">
                                    <AvatarImage src={data.profile?.user?.avatar || ""} />
                                    <AvatarFallback className="bg-primary/5 text-primary"><Building2 /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-slate-900">{data.profile?.user?.username || "Nhà cung cấp"}</h3>
                                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Đơn vị cung cấp uy tín
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Table */}
                        <div className="border border-slate-200 text-sm rounded-2xl overflow-hidden bg-white mt-2">
                            <div className="flex justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <span className="text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /> Quốc gia phục vụ</span>
                                <span className="font-semibold text-slate-900 text-right">Vietnam</span>
                            </div>
                            <div className="flex justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <span className="text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /> Khu vực phục vụ</span>
                                <span className="font-semibold text-slate-900 text-right">{data.district ? `${data.district}, ` : ''}{data.province || 'Toàn quốc'}</span>
                            </div>
                            <div className="flex justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <span className="text-slate-500 flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /> Số điện thoại liên hệ</span>
                                <span className="font-semibold text-slate-900 text-right">{data.contactPhone || data.profile?.user?.phonenumber || "---"}</span>
                            </div>
                            <div className="flex justify-between p-4 hover:bg-slate-50 transition-colors">
                                <span className="text-slate-500 flex items-center gap-2"><UserCircle2 className="w-4 h-4 shrink-0" /> Tên liên hệ</span>
                                <span className="font-semibold text-slate-900 text-right">{data.contactName || data.profile?.user?.username || "---"}</span>
                            </div>
                        </div>

                        {/* Specialty Block */}
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mt-2">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Chuyên môn sửa chữa</h3>
                            <div className="text-sm text-slate-500 mb-3">Nhóm lỗi</div>
                            <div className="flex flex-wrap gap-2">
                                {Specialties.map((s: string, idx: number) => (
                                    <span key={idx} className="bg-white px-3 py-1.5 rounded-full border border-slate-200 text-sm font-medium text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                        {s.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Vehicle Types Block */}
                        {VehicleTypes.length > 0 && VehicleTypes[0] !== "" && (
                            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 mt-2">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Dòng xe tiếp nhận</h3>
                                <div className="text-sm text-slate-500 mb-3">Loại phương tiện</div>
                                <div className="flex flex-wrap gap-2">
                                    {VehicleTypes.map((v: string, idx: number) => {
                                        if (!v.trim()) return null;
                                        return (
                                            <span key={idx} className="bg-white px-3 py-1.5 rounded-full border border-blue-200 text-sm font-medium text-blue-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                                {v.trim()}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-6 flex flex-wrap gap-3 justify-end">
                            <Button asChild variant="outline" className="font-semibold border-slate-200 rounded-xl flex-1 sm:flex-none justify-center gap-2 hover:bg-slate-50 text-slate-700 min-h-[44px]">
                                <a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.district ? data.district + ', ' : ''}${data.province || 'Vietnam'}`)}`}>
                                    <MapPin className="w-4 h-4" /> Định vị
                                </a>
                            </Button>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="font-semibold border-slate-200 rounded-xl flex-1 sm:flex-none justify-center gap-2 hover:bg-slate-50 text-slate-700 min-h-[44px]">
                                        <Phone className="w-4 h-4" /> Liên hệ
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md rounded-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold border-b pb-4 mb-2 text-center text-slate-900 border-slate-100">Thông tin liên hệ</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex flex-col gap-3 py-2">
                                        <a href={`tel:${data.contactPhone || data.profile?.user?.phonenumber || ''}`} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all group">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-[0_2px_10px_rgba(37,99,235,0.1)] group-hover:scale-110 transition-transform">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Điện thoại</p>
                                                <p className="text-lg font-black text-slate-900 group-hover:text-blue-700 tracking-tight">{data.contactPhone || data.profile?.user?.phonenumber || 'Chưa cập nhật'}</p>
                                            </div>
                                        </a>

                                        <a href={`mailto:${data.profile?.user?.email || ''}`} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all group">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-[0_2px_10px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email</p>
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">{data.profile?.user?.email || 'Chưa cập nhật'}</p>
                                            </div>
                                        </a>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Button asChild className="font-bold bg-primary hover:bg-primary/90 text-white rounded-xl flex-1 sm:flex-none justify-center gap-2 shadow-sm min-h-[44px]">
                                <button onClick={() => window.dispatchEvent(new CustomEvent('open-chat', { detail: { vendorId: data.profile?.user?.id } }))}>
                                    <MessageSquare className="w-4 h-4" /> Nhắn tin
                                </button>
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
