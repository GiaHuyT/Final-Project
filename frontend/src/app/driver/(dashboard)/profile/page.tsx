"use client";

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import http from '@/lib/http';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import { Loader2, User, CreditCard, MapPin, Briefcase, FileText, Phone, Mail, Calendar, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
    username: z.string().min(2, "Tên hiển thị phải có ít nhất 2 ký tự"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function DriverProfilePage() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // User core data (editable)
    const [userNameDisplay, setUserNameDisplay] = useState("Tài xế");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | 'REMOVE' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Driver Rental Service data (read-only)
    const [driverInfo, setDriverInfo] = useState<any>(null);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    const watchedUsername = watch('username');

    const fetchProfile = async () => {
        try {
            const { data: profileData } = await http.get('/users/profile');
            setUserNameDisplay(profileData.username || "Tài xế");
            // Lấy thông tin chi tiết tài xế
            const driverService = profileData.serviceProfiles?.driverRentalServices?.[0];
            setDriverInfo(driverService || null);

            const displayAvatar = profileData.avatar || driverService?.avatarUrl || null;
            setAvatarUrl(displayAvatar);
            setPreviewAvatarUrl(displayAvatar);

            reset({
                username: profileData.username,
            });
        } catch (error: any) {
            console.error('Fetch Profile Error:', error);
            toast.error('Không thể tải thông tin hồ sơ tài xế');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [reset]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn tệp ảnh!');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ảnh quá lớn (tối đa 2MB)!');
            return;
        }

        const localUrl = URL.createObjectURL(file);
        setPreviewAvatarUrl(localUrl);
        setAvatarFile(file);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onSubmit = async (values: ProfileFormValues) => {
        setIsSaving(true);
        try {
            let finalAvatarUrl = avatarUrl;

            if (avatarFile instanceof File) {
                const formData = new FormData();
                formData.append('file', avatarFile);
                const res = await http.post('/users/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (res.status === 201 || res.status === 200) {
                    finalAvatarUrl = res.data.avatarUrl;
                }
            }

            await http.patch('/users/profile', {
                username: values.username,
                avatar: avatarFile === 'REMOVE' ? null : finalAvatarUrl
            });
            
            if (avatarFile === 'REMOVE') finalAvatarUrl = null;

            setUserNameDisplay(values.username);
            setAvatarUrl(finalAvatarUrl);
            setPreviewAvatarUrl(finalAvatarUrl);
            setAvatarFile(null);

            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                userObj.username = values.username;
                userObj.avatar = finalAvatarUrl;
                localStorage.setItem("user", JSON.stringify(userObj));
            }

            toast.success('Cập nhật hồ sơ thành công!');
            window.dispatchEvent(new Event('user-updated'));
        } catch (error: any) {
            console.error('Update Profile Error:', error);
            const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    const readOnlyInputClass = "bg-slate-50/50 text-slate-700 border-slate-200 cursor-default focus-visible:ring-0 font-medium";

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hồ sơ Tài xế</h1>
                <p className="text-slate-500 mt-2 text-[15px]">
                    Quản lý thông tin cá nhân và hồ sơ đối tác của bạn.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CỘT TRÁI: THÔNG TIN CƠ BẢN & ẢNH ĐẠI DIỆN */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="flex flex-col items-center pb-6 border-b border-slate-50">
                                <div className="relative group mb-4">
                                    <Avatar className="h-28 w-28 border-4 border-slate-50 shadow-sm relative overflow-hidden group">
                                        <AvatarImage src={previewAvatarUrl || undefined} alt={watchedUsername || userNameDisplay} className="object-cover" />
                                        <AvatarFallback className="text-3xl bg-emerald-100 text-emerald-700 font-bold">
                                            {(watchedUsername || userNameDisplay).substring(0, 1).toUpperCase()}
                                        </AvatarFallback>
                                        {isSaving && avatarFile instanceof File && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                                            </div>
                                        )}
                                    </Avatar>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAvatarClick}
                                        className="absolute bottom-0 right-0 h-8 w-8 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-emerald-700 transition-colors shadow-sm"
                                    >
                                        <User className="h-4 w-4" />
                                    </button>
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">{watchedUsername || userNameDisplay}</h2>
                                <div className="flex items-center gap-1.5 mt-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Tài khoản Đã xác thực</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-sm font-bold text-slate-700">Tên hiển thị (Username)</Label>
                                    <Input
                                        id="username"
                                        {...register('username')}
                                        className="bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl h-11"
                                    />
                                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                                </div>
                                
                                <Button type="submit" disabled={isSaving} className="bg-slate-900 hover:bg-black text-white w-full h-11 shadow-sm rounded-xl font-bold">
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Cập nhật Tên & Ảnh"}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {driverInfo?.status && (
                        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                Trạng thái phê duyệt
                            </h3>
                            <div className={cn(
                                "p-4 rounded-xl flex items-start gap-3",
                                driverInfo.status === 'Chờ duyệt' ? "bg-amber-50 border border-amber-100" :
                                driverInfo.status === 'Hoạt động' ? "bg-emerald-50 border border-emerald-100" :
                                "bg-red-50 border border-red-100"
                            )}>
                                {driverInfo.status === 'Chờ duyệt' ? <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" /> :
                                driverInfo.status === 'Hoạt động' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> :
                                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                                
                                <div>
                                    <p className={cn(
                                        "font-bold text-[15px]",
                                        driverInfo.status === 'Chờ duyệt' ? "text-amber-700" :
                                        driverInfo.status === 'Hoạt động' ? "text-emerald-700" :
                                        "text-red-700"
                                    )}>
                                        {driverInfo.status === 'Chờ duyệt' ? "Đang chờ Admin duyệt" :
                                         driverInfo.status === 'Hoạt động' ? "Hồ sơ Hợp lệ" : "Bị từ chối"}
                                    </p>
                                    <p className={cn(
                                        "text-xs mt-1 font-medium leading-relaxed",
                                        driverInfo.status === 'Chờ duyệt' ? "text-amber-600" :
                                        driverInfo.status === 'Hoạt động' ? "text-emerald-600" :
                                        "text-red-600"
                                    )}>
                                        {driverInfo.status === 'Chờ duyệt' ? "Hồ sơ của bạn đang được kiểm tra. Vui lòng chờ 1-2 ngày." :
                                         driverInfo.status === 'Hoạt động' ? "Bạn có thể bắt đầu nhận chuyến đi ngay bây giờ." : "Vui lòng liên hệ hỗ trợ để biết thêm chi tiết."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* CỘT PHẢI: THÔNG TIN CHI TIẾT (READ ONLY) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* KHỐI 1: THÔNG TIN CÁ NHÂN */}
                    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <User className="w-5 h-5 text-emerald-600" />
                                Thông tin Cá nhân
                            </h3>
                            <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">Chỉ xem</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500">Họ và tên thật</Label>
                                <Input readOnly value={driverInfo?.name || ''} className={readOnlyInputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500">Ngày sinh</Label>
                                <Input readOnly value={driverInfo?.dob || ''} className={readOnlyInputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500">Số CCCD / CMND</Label>
                                <Input readOnly value={driverInfo?.idCardNumber || ''} className={readOnlyInputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500">Số điện thoại</Label>
                                <Input readOnly value={driverInfo?.phoneNumber || ''} className={readOnlyInputClass} />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-xs font-bold text-slate-500">Email liên lạc</Label>
                                <Input readOnly value={driverInfo?.email || ''} className={readOnlyInputClass} />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-xs font-bold text-slate-500">Địa chỉ thường trú</Label>
                                <Input readOnly value={driverInfo?.currentAddress || ''} className={readOnlyInputClass} />
                            </div>
                            {driverInfo?.languages && driverInfo.languages.length > 0 && (
                                <div className="space-y-2 md:col-span-2 mt-2">
                                    <Label className="text-xs font-bold text-slate-500">Ngoại ngữ</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {driverInfo.languages.map((lang: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[13px] font-bold rounded-lg border border-blue-100">
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {driverInfo?.bio && (
                                <div className="space-y-1.5 md:col-span-2 mt-2">
                                    <Label className="text-xs font-bold text-slate-500">Giới thiệu bản thân</Label>
                                    <div className="p-3 bg-slate-50 rounded-xl text-[14px] text-slate-700 font-medium border border-slate-100 leading-relaxed">
                                        {driverInfo.bio}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KHỐI 2: THÔNG TIN BẰNG LÁI & HỒ SƠ */}
                    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-emerald-600" />
                                Bằng lái & Nghiệp vụ
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500">Hạng bằng lái</Label>
                                <Input readOnly value={driverInfo?.licenseType || ''} className={readOnlyInputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500">Kinh nghiệm (Năm)</Label>
                                <Input readOnly value={driverInfo?.experienceYears ? `${driverInfo.experienceYears} năm` : '0 năm'} className={readOnlyInputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500">Số Giấy phép lái xe</Label>
                                <Input readOnly value={driverInfo?.licenseNumber || ''} className={readOnlyInputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500">Ngày cấp</Label>
                                <Input readOnly value={driverInfo?.licenseIssueDate || ''} className={readOnlyInputClass} />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-xs font-bold text-slate-500">Hình thức làm việc đăng ký</Label>
                                <Input readOnly value={driverInfo?.workType === 'full-time' ? 'Toàn thời gian (Full-time)' : 'Bán thời gian (Part-time)'} className={readOnlyInputClass} />
                            </div>
                            
                            <div className="md:col-span-2 pt-4 border-t border-slate-100 mt-2">
                                <Label className="text-xs font-bold text-slate-500 mb-3 block">Cam kết An toàn & Lý lịch</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        {driverInfo?.healthConditionValid ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-300" />}
                                        <span className="text-[13px] font-medium text-slate-700">Đủ sức khỏe lái xe</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!driverInfo?.hasCriminalRecord ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                        <span className="text-[13px] font-medium text-slate-700">Lý lịch tư pháp trong sạch</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {driverInfo?.agreedToNoAlcohol ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-300" />}
                                        <span className="text-[13px] font-medium text-slate-700">Cam kết không sử dụng chất kích thích</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KHỐI 3: NGÂN HÀNG & THIẾT BỊ */}
                    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-emerald-600" />
                                Ngân hàng & Thiết bị
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-xs font-bold text-slate-500">Ngân hàng thụ hưởng</Label>
                                <Input readOnly value={driverInfo?.bankName || ''} className={readOnlyInputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500">Chủ tài khoản</Label>
                                <Input readOnly value={driverInfo?.bankAccountName || ''} className={readOnlyInputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500">Số tài khoản</Label>
                                <Input readOnly value={driverInfo?.bankAccountNumber || ''} className={readOnlyInputClass} />
                            </div>
                        </div>
                    </div>

                    {/* KHỐI 4: HÌNH ẢNH HỒ SƠ */}
                    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-600" />
                                Hình ảnh Giấy tờ
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {driverInfo?.idCardFrontUrl && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500">CCCD - Mặt trước</Label>
                                        <img src={driverInfo.idCardFrontUrl} alt="CCCD Front" className="w-full h-auto rounded-xl border border-slate-200" />
                                </div>
                            )}
                            {driverInfo?.idCardBackUrl && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500">CCCD - Mặt sau</Label>
                                        <img src={driverInfo.idCardBackUrl} alt="CCCD Back" className="w-full h-auto rounded-xl border border-slate-200" />
                                </div>
                            )}
                            {driverInfo?.licenseFrontUrl && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500">Bằng lái xe - Mặt trước</Label>
                                        <img src={driverInfo.licenseFrontUrl} alt="License Front" className="w-full h-auto rounded-xl border border-slate-200" />
                                </div>
                            )}
                            {driverInfo?.licenseBackUrl && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500">Bằng lái xe - Mặt sau</Label>
                                        <img src={driverInfo.licenseBackUrl} alt="License Back" className="w-full h-auto rounded-xl border border-slate-200" />
                                </div>
                            )}
                            {driverInfo?.criminalRecordUrl && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs font-bold text-slate-500">Lý lịch tư pháp</Label>
                                        <img src={driverInfo.criminalRecordUrl} alt="Criminal Record" className="w-full h-auto rounded-xl border border-slate-200" />
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
