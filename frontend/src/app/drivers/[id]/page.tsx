"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Car, Clock, MapPin, Star, User, ShieldCheck, Languages, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DriverPublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [driver, setDriver] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDriver = async () => {
            try {
                const res = await http.get(`/users/driver/${params?.id}/profile`);
                setDriver(res.data);
            } catch (error) {
                console.error(error);
                toast.error("Không tìm thấy thông tin tài xế");
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        if (params?.id) {
            fetchDriver();
        }
    }, [params?.id, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!driver) return null;

    const profile = driver.driverProfile;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <Card className="text-center overflow-hidden border-none shadow-lg">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-24"></div>
                        <CardContent className="px-6 pb-6 pt-0">
                            <div className="flex justify-center -mt-12 mb-4">
                                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                                    <AvatarImage src={driver.avatar || `https://ui-avatars.com/api/?name=${driver.username}`} />
                                    <AvatarFallback>{driver.username?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">{driver.username}</h1>
                            <div className="flex items-center justify-center gap-1 mt-2 text-amber-500">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="font-bold text-lg">{driver.averageRating}</span>
                                <span className="text-slate-500 text-sm font-normal">({driver.totalRatings} đánh giá)</span>
                            </div>

                            <div className="flex justify-center gap-2 mt-4">
                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                    <ShieldCheck className="w-3 h-3 mr-1" /> Đã xác minh
                                </Badge>
                                {profile?.hasServiceExperience && (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                        Nhiều kinh nghiệm
                                    </Badge>
                                )}
                            </div>

                            <div className="mt-8 space-y-4">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg">
                                    ĐẶT XE NGAY
                                </Button>
                                <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                                    Nhắn tin cho Tài xế
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Kỹ năng & Chuyên môn</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Car className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Hạng Bằng Lái</p>
                                    <p className="font-semibold text-slate-800">{profile?.licenseType || 'Hạng B2'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Kinh nghiệm lái xe</p>
                                    <p className="font-semibold text-slate-800">{profile?.experienceYears || 0} năm</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                    <Languages className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Ngoại ngữ</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {profile?.languages?.length > 0 ? (
                                            profile.languages.map((lang: string, i: number) => (
                                                <Badge key={i} variant="outline" className="text-xs bg-white">{lang}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm font-semibold text-slate-800">Tiếng Việt</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl border-b pb-4">Thông tin dịch vụ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            {profile?.bio && (
                                <div>
                                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
                                        <User className="w-5 h-5 text-slate-400" /> Giới thiệu bản thân
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg italic">
                                        "{profile.bio}"
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="border border-slate-100 p-4 rounded-xl shadow-sm">
                                    <h3 className="text-sm text-slate-500 mb-1">Mức giá thuê (Tham khảo)</h3>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {profile?.pricePerKm ? profile.pricePerKm.toLocaleString('vi-VN') : 0} đ<span className="text-sm text-slate-500 font-normal">/km</span>
                                    </p>
                                </div>
                                <div className="border border-slate-100 p-4 rounded-xl shadow-sm">
                                    <h3 className="text-sm text-slate-500 mb-1">Tham gia từ</h3>
                                    <p className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <CalendarDays className="w-5 h-5 text-blue-500" />
                                        {new Date(driver.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                                    <MapPin className="w-5 h-5 text-red-500" /> Khu vực hoạt động
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile?.operatingCities?.length > 0 ? (
                                        profile.operatingCities.map((city: string, i: number) => (
                                            <Badge key={i} className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-3 py-1 text-sm">
                                                {city}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 italic">Tài xế chưa cập nhật khu vực hoạt động</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Placeholder for Reviews Component */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500" /> Nhận xét từ khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <p className="text-slate-500">Chưa có đánh giá nào cho tài xế này.</p>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
