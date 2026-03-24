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
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
    email: z.string().email(),
    username: z.string().min(2, "Tên nhà cung cấp phải có ít nhất 2 ký tự"),
    phonenumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function VendorProfilePage() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userNameDisplay, setUserNameDisplay] = useState("Nhà cung cấp");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | 'REMOVE' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    const watchedUsername = watch('username');

    const fetchProfile = async () => {
        try {
            const { data: profileData } = await http.get('/users/profile');
            setUserNameDisplay(profileData.username || "Nhà cung cấp");
            setAvatarUrl(profileData.avatar || null);
            setPreviewAvatarUrl(profileData.avatar || null);
            reset({
                email: profileData.email,
                username: profileData.username,
                phonenumber: profileData.phonenumber || "",
            });
        } catch (error: any) {
            console.error('Fetch Profile Error:', error);
            toast.error('Không thể tải thông tin hồ sơ nhà cung cấp');
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
                phonenumber: values.phonenumber,
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
                userObj.phonenumber = values.phonenumber;
                userObj.avatar = finalAvatarUrl;
                localStorage.setItem("user", JSON.stringify(userObj));
            }

            toast.success('Cập nhật hồ sơ nhà cung cấp thành công!');
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
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
            <div className="space-y-6 border-b border-gray-100 pb-8">
                <h1 className="text-2xl text-gray-800 font-normal">
                    Nhà cung cấp: <span className="font-semibold text-orange-600">{watchedUsername || userNameDisplay}</span>
                </h1>

                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-gray-50 shadow-sm relative overflow-hidden group">
                        <AvatarImage src={previewAvatarUrl || undefined} alt={watchedUsername || userNameDisplay} />
                        <AvatarFallback className="text-2xl bg-orange-50 text-orange-600">
                            {(watchedUsername || userNameDisplay).substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                        {isSaving && avatarFile instanceof File && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                            </div>
                        )}
                    </Avatar>
                    <div className="flex gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <Button
                            onClick={handleAvatarClick}
                            disabled={isSaving}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            {isSaving && avatarFile instanceof File ? "Đang tải lên..." : "Tải ảnh mới"}
                        </Button>
                        <Button
                            variant="outline"
                            className="text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            disabled={isSaving || !previewAvatarUrl}
                            onClick={() => {
                                if (!previewAvatarUrl) return;
                                setPreviewAvatarUrl(null);
                                setAvatarFile('REMOVE');
                            }}
                        >
                            Xóa ảnh
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">Thông tin chi tiết</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="username" className="text-sm font-medium text-gray-700">Tên cửa hàng/đơn vị</Label>
                            <Input
                                id="username"
                                {...register('username')}
                                className="bg-gray-50/50 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                            />
                            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email liên hệ</Label>
                            <Input
                                id="email"
                                {...register('email')}
                                disabled
                                className="bg-gray-100 text-gray-500 border-gray-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phonenumber" className="text-sm font-medium text-gray-700">Số điện thoại</Label>
                            <Input
                                id="phonenumber"
                                {...register('phonenumber')}
                                className="bg-gray-50/50 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                                placeholder="Nhập số điện thoại"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-50">
                        <Button type="submit" disabled={isSaving} className="bg-orange-600 hover:bg-orange-700 text-white min-w-[140px] shadow-sm shadow-orange-200">
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : "Lưu thay đổi"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
