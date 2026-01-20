'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import http from '@/lib/http';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import {
  User,
  ShoppingCart,
  MapPin,
  Clock,
  Gavel,
  Bell,
  Box,
  Truck,
  Car,
  Wrench,
  Heart,
  Store
} from 'lucide-react';
import Link from 'next/link';

// Schema validation
const profileSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2, "Username phải có ít nhất 2 ký tự"),
  phonenumber: z.string().optional(), // Added phone number
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userNameDisplay, setUserNameDisplay] = useState("Người dùng");

  // Setup form
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Fetch data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await http.get('/users/profile');
        console.log('Profile Data Fetched:', data);
        setUserNameDisplay(data.username || "Người dùng");
        reset({
          email: data.email,
          username: data.username,
          phonenumber: data.phonenumber || "",
        });
      } catch (error) {
        console.error('Fetch Profile Error:', error);
        toast.error('Không thể tải thông tin cá nhân');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  // Handle Submit
  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    try {
      // await http.patch('/users/profile', values); // API Update placeholder
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserNameDisplay(values.username);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${active ? 'text-orange-600 bg-orange-50 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
      <Icon className="w-5 h-5" />
      <span className="text-sm">{label}</span>
      {active && <span className="ml-auto text-xs">›</span>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Sidebar */}
        <div className="md:col-span-3 lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-hidden">
            <div className="space-y-1">
              <SidebarItem icon={User} label="Hồ sơ của tôi" active />
              <SidebarItem icon={ShoppingCart} label="Giỏ hàng" />
              <SidebarItem icon={MapPin} label="Số địa chi" />
              <SidebarItem icon={Clock} label="Đơn hàng" />
              <SidebarItem icon={Gavel} label="Danh sách phiên trả giá" />
              <SidebarItem icon={Bell} label="Thông báo" />
              <SidebarItem icon={Box} label="Đăng tin hàng" />
              <SidebarItem icon={Truck} label="Thuê xe ghép" />
              <SidebarItem icon={Car} label="Thuê xe riêng" />
              <SidebarItem icon={Wrench} label="Lịch sử tìm sửa chữa" />
              <SidebarItem icon={Heart} label="Danh sách yêu thích" />
            </div>
          </div>

          <Button variant="outline" className="w-full bg-white border-dashed border-gray-300 hover:border-orange-500 hover:text-orange-600 h-10 gap-2">
            <Store className="w-4 h-4" />
            Tài khoản nhà cung cấp
          </Button>
        </div>

        {/* Main Content */}
        <div className="md:col-span-9 lg:col-span-9">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">

            {/* Header & Avatar */}
            <div className="space-y-6 border-b border-gray-100 pb-8">
              <h1 className="text-2xl text-gray-800 font-normal">
                Xin chào, <span className="font-semibold">{userNameDisplay}</span>
              </h1>

              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-gray-50 shadow-sm">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User Avatar" />
                  <AvatarFallback className="text-2xl bg-gray-100 text-gray-500">
                    {userNameDisplay.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-3">
                  <Button className="bg-[#E65E2C] hover:bg-[#d95222] text-white">
                    Upload
                  </Button>
                  <Button variant="outline" className="text-gray-600 border-gray-200">
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Thông tin cá nhân</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username (Displayed as "Họ" + "Tên" in mockup but user requested single field) */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                    <Input
                      id="username"
                      {...register('username')}
                      className="bg-gray-50/50 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                    />
                    {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="email"
                      {...register('email')}
                      disabled
                      className="bg-gray-100 text-gray-500 border-gray-200"
                    />
                  </div>

                  {/* Phone */}
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

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSaving} className="bg-[#E65E2C] hover:bg-[#d95222] text-white min-w-[120px]">
                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}