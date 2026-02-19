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
  Store,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import AddressModal from '@/components/address/AddressModal';

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

  const [tab, setTab] = useState("profile");

  // Address states
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

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

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const { data } = await http.get('/addresses');
      setAddresses(data);
    } catch (error) {
      console.error('Fetch Addresses Error:', error);
      toast.error('Không thể tải danh sách địa chỉ');
    }
  };

  useEffect(() => {
    if (tab === 'addresses') {
      fetchAddresses();
    }
  }, [tab]);

  const handleSaveAddress = async (formData: any) => {
    try {
      // Clean up for API (ensure lat/lng are numbers)
      const dataToSave = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };

      if (editingAddress) {
        await http.patch(`/addresses/${editingAddress.id}`, dataToSave);
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        await http.post('/addresses', dataToSave);
        toast.success('Thêm địa chỉ mới thành công');
      }
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      console.error('Save Address Error:', error);
      toast.error('Có lỗi xảy ra khi lưu địa chỉ');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      await http.delete(`/addresses/${id}`);
      toast.success('Xóa địa chỉ thành công');
      fetchAddresses();
    } catch (error) {
      console.error('Delete Address Error:', error);
      toast.error('Không thể xóa địa chỉ');
    }
  };

  // Handle Submit
  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    try {
      await http.patch('/users/profile', {
        username: values.username,
        phonenumber: values.phonenumber
      });
      setUserNameDisplay(values.username);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error('Update Profile Error:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${active ? 'text-orange-600 bg-orange-50 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
    >
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
              <SidebarItem icon={User} label="Hồ sơ của tôi" active={tab === "profile"} onClick={() => setTab("profile")} />
              <SidebarItem icon={ShoppingCart} label="Giỏ hàng" />
              <SidebarItem icon={MapPin} label="Số địa chỉ" active={tab === "addresses"} onClick={() => setTab("addresses")} />
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
                  <AvatarFallback className="text-2xl bg-gray-100 text-gray-500">
                    {userNameDisplay.substring(0, 1).toUpperCase()}
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
            {tab === "profile" ? (
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
            ) : tab === "addresses" ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Số địa chỉ của tôi</h2>
                    <p className="text-sm text-gray-500">Quản lý các địa chỉ nhận hàng của bạn</p>
                  </div>
                  <Button
                    onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true); }}
                    className="bg-[#E65E2C] hover:bg-[#d95222] text-white gap-2 shadow-lg shadow-orange-200 transition-all hover:scale-105"
                  >
                    <Plus className="w-4 h-4" /> Thêm địa chỉ mới
                  </Button>
                </div>

                <div className="space-y-4">
                  {addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <div key={addr.id} className="group border border-gray-100 rounded-xl p-5 bg-white hover:border-orange-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-800 text-lg">{addr.title}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-200 font-bold uppercase tracking-wider">Mặc định</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="font-medium">{addr.receiverName}</span>
                              <span className="text-gray-300">|</span>
                              <span>{addr.receiverPhone}</span>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-sm text-gray-500 italic">{addr.detail}</p>
                              <p className="text-sm text-gray-700">{addr.ward}, {addr.district}, {addr.province}</p>
                            </div>
                            {addr.latitude && addr.longitude && (
                              <div className="flex items-center gap-1 text-[10px] text-blue-500 font-medium bg-blue-50 w-fit px-2 py-0.5 rounded">
                                <MapPin className="w-3 h-3" /> Đã ghim vị trí ({addr.latitude.toFixed(4)}, {addr.longitude.toFixed(4)})
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 border-blue-100 hover:bg-blue-50"
                              onClick={() => { setEditingAddress(addr); setIsAddressModalOpen(true); }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 border-red-100 hover:bg-red-50"
                              onClick={() => handleDeleteAddress(addr.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Bạn chưa có địa chỉ nào</p>
                      <button
                        onClick={() => setIsAddressModalOpen(true)}
                        className="text-orange-600 text-sm font-bold mt-2 hover:underline"
                      >
                        Thêm địa chỉ đầu tiên ngay
                      </button>
                    </div>
                  )}
                </div>

                <AddressModal
                  isOpen={isAddressModalOpen}
                  onClose={() => { setIsAddressModalOpen(false); setEditingAddress(null); }}
                  onSave={handleSaveAddress}
                  initialData={editingAddress}
                />
              </div>
            ) : (
              <div className="py-20 text-center text-gray-400">
                Chức năng đang được phát triển
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}