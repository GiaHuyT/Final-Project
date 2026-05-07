"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Wrench, ShieldCheck, Edit, Trash2, Loader2, Save, ArrowLeft, Briefcase, FileText } from "lucide-react";
import http from "@/lib/http";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function MaintenanceManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const mockData = [
      {
          id: 1,
          name: "Gói bảo dưỡng xe máy cấp 1",
          price: 150000,
          description: "Thay nhớt, kiểm tra phanh, lốp, bơm hơi.",
          status: "Hoạt động",
          profile: { user: { username: "Honda Head 1", email: "honda1@gmail.com" } }
      },
      {
          id: 2,
          name: "Bảo dưỡng Ô tô toàn diện",
          price: 2500000,
          description: "Kiểm tra động cơ, thay dầu máy, lọc gió, vệ sinh buồng đốt.",
          status: "Hoạt động",
          profile: { user: { username: "Gara AutoPro", email: "autopro@vn" } }
      },
      {
          id: 3,
          name: "Thay dầu nhớt cao cấp",
          price: 350000,
          description: "Sử dụng dầu Motul 300V cho các loại xe tay ga, xe côn tay.",
          status: "Hoạt động",
          profile: { user: { username: "Shop 299", email: "shop299@yahoo.com" } }
      },
      {
          id: 4,
          name: "Vệ sinh kim phun điện tử",
          price: 200000,
          description: "Vệ sinh hệ thống kim phun xăng điện tử FI bằng sóng siêu âm.",
          status: "Hoạt động",
          profile: { user: { username: "Sửa xe Thanh", email: "thanhsuaxe@gmail.com" } }
      },
      {
          id: 5,
          name: "Bảo dưỡng điều hòa Ô tô",
          price: 800000,
          description: "Vệ sinh dàn lạnh, nạp gas, kiểm tra lốc lạnh.",
          status: "Tạm ngưng",
          profile: { user: { username: "Gara Thăng Long", email: "gara.thanglong@gmail.com" } }
      },
      {
          id: 6,
          name: "Phủ Ceramic bảo vệ sơn xe",
          price: 4500000,
          description: "Phủ gốm Ceramic 9H cao cấp bảo vệ bề mặt sơn khỏi xước dăm và ố nước.",
          status: "Hoạt động",
          profile: { user: { username: "Auto Spa Detail", email: "contact@autospa.vn" } }
      },
      {
          id: 7,
          name: "Đánh bóng xe chuyên sâu",
          price: 1200000,
          description: "Xử lý xước quầng, xước xoáy, phục hồi độ bóng sâu cho bề mặt sơn.",
          status: "Hoạt động",
          profile: { user: { username: "CarCare 247", email: "support@carcare247.com" } }
      },
      {
          id: 8,
          name: "Vệ sinh khoang máy Ô tô",
          price: 600000,
          description: "Làm sạch khoang động cơ bằng hơi nước nóng, phủ dưỡng nhựa/cao su.",
          status: "Hoạt động",
          profile: { user: { username: "Gara AutoPro", email: "autopro@vn" } }
      },
      {
          id: 9,
          name: "Bảo dưỡng phanh tay ga",
          price: 120000,
          description: "Kiểm tra má phanh, vệ sinh cụm phanh, thay dầu phanh DOT4.",
          status: "Hoạt động",
          profile: { user: { username: "Piaggio Topcom", email: "service@topcom.vn" } }
      },
      {
          id: 10,
          name: "Thay thế ắc quy GS Ô tô",
          price: 1550000,
          description: "Kiểm tra điện áp, thay bình ắc quy GS khô, bảo hành 12 tháng.",
          status: "Hoạt động",
          profile: { user: { username: "Ắc quy Tuấn", email: "acquytuan@gmail.com" } }
      },
      {
          id: 11,
          name: "Bọc lại ghế da công nghiệp",
          price: 5500000,
          description: "Tháo bọc ghế cũ, bọc lại bằng da Microfiber cao cấp nhiều màu sắc.",
          status: "Tạm ngưng",
          profile: { user: { username: "Nội thất Ô tô Việt", email: "noithatviet@yahoo.com" } }
      },
      {
          id: 12,
          name: "Dán phim cách nhiệt 3M",
          price: 8500000,
          description: "Dán phim cách nhiệt 3M Crystalline toàn bộ xe, chống tia UV 99%.",
          status: "Hoạt động",
          profile: { user: { username: "3M AutoFilm Hanoi", email: "hanoi@3mauto.vn" } }
      }
  ];

  const [maintenanceServices, setMaintenanceServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
      name: '',
      price: '',
      description: '',
      status: 'Hoạt động',
  });
  
  const fetchServices = async () => {
      try {
          setLoading(true);
          const { data } = await http.get('/maintenance/public');
          setMaintenanceServices(data || []);
      } catch (error) {
          toast.error('Không thể tải danh sách dịch vụ');
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openEdit = (service: any) => {
      setSelectedService(service);
      setFormData({
          name: service.name || '',
          price: service.price?.toString() || '',
          description: service.description || '',
          status: service.status || 'Hoạt động',
      });
      setIsEditOpen(true);
  };

  const handleEdit = async () => {
      if (!formData.name) {
          toast.error('Vui lòng nhập tên dịch vụ');
          return;
      }
      setIsSubmitting(true);
      try {
          await http.patch(`/maintenance/${selectedService.id}`, {
              ...formData,
              price: parseFloat(formData.price) || 0,
          });
          toast.success('Cập nhật dịch vụ thành công');
          setIsEditOpen(false);
          fetchServices();
      } catch (error) {
          toast.error('Có lỗi xảy ra');
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;
    try {
      await http.delete(`/maintenance/${id}`);
      toast.success('Xóa thành công');
      fetchServices();
    } catch (error) {
      toast.error('Không thể xóa dịch vụ');
    }
  };

  const filteredServices = maintenanceServices.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profile?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-body space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!isEditOpen ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3 uppercase">
                <Wrench className="w-8 h-8 text-blue-600" />
                Quản lý Dịch vụ Bảo dưỡng
              </h1>
              <p className="text-slate-500 mt-1 font-medium">
                Theo dõi và quản lý các dịch vụ bảo dưỡng định kỳ trên hệ thống.
              </p>
            </div>
            <Link href="/admin/maintenance/add">
                <Button className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-900 transition-colors shadow-sm h-auto">
                    <Plus className="w-5 h-5" /> Thêm dịch vụ mới
                </Button>
            </Link>
          </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
              placeholder="Tìm kiếm dịch vụ bảo dưỡng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-lg border shadow-sm">
            Tổng cộng: <span className="text-blue-600">{filteredServices.length}</span> dịch vụ
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-10 py-6">Dịch vụ</th>
                <th className="px-10 py-6">Nhà cung cấp</th>
                <th className="px-10 py-6 text-center">Giá (Dự kiến)</th>
                <th className="px-10 py-6 text-center">Trạng thái</th>
                <th className="px-10 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr><td colSpan={5} className="p-16 text-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" /></td></tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-slate-500">
                    <ShieldCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="font-bold text-lg text-slate-400">Chưa có dịch vụ bảo dưỡng nào được đăng ký trên hệ thống.</p>
                  </td>
                </tr>
              ) : (
                filteredServices.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/5 transition-colors group">
                    <td className="px-10 py-6 align-middle">
                      <div className="font-black text-gray-900 text-base">{item.name}</div>
                      <div className="text-[11px] font-bold text-gray-400 mt-1 line-clamp-1 max-w-xs">{item.description}</div>
                    </td>
                    <td className="px-10 py-6 align-middle">
                      <div className="font-bold text-slate-700">{item.profile?.user?.username || 'Unknown'}</div>
                      <div className="text-[11px] text-slate-400">{item.profile?.user?.email}</div>
                    </td>
                    <td className="px-10 py-6 align-middle text-center">
                      <div className="font-black text-blue-600">{(item.price || 0).toLocaleString('vi-VN')} <span className="text-[10px] opacity-60">đ</span></div>
                    </td>
                    <td className="px-10 py-6 align-middle text-center">
                      <Badge className={`rounded-full px-4 py-1 uppercase text-[9px] font-black shadow-sm border-2 ${
                          item.status === 'Hoạt động' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                          {item.status}
                      </Badge>
                    </td>
                    <td className="px-10 py-6 align-middle text-right space-x-2">
                      <Button size="icon" variant="outline" onClick={() => openEdit(item)} className="w-9 h-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 border-gray-100">
                          <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleDelete(item.id)} className="w-9 h-9 rounded-xl hover:bg-red-50 hover:text-red-600 border-gray-100">
                          <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      ) : (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(false)} className="rounded-full hover:bg-gray-100 h-12 w-12 text-gray-500">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Cập Nhật Dịch Vụ Bảo Dưỡng</h1>
                    <p className="text-muted-foreground font-medium">Chỉnh sửa thông tin gói dịch vụ bảo dưỡng định kỳ trên hệ thống.</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* General Information Card */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Wrench className="w-48 h-48" />
                    </div>

                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Thông Tin Chung</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="name" className="text-sm font-bold text-gray-700">Tên dịch vụ <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="rounded-xl h-12 bg-gray-50/50 text-base"
                                placeholder="VD: Gói bảo dưỡng cấp 1 (5000km)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-sm font-bold text-gray-700">Giá dự kiến (VNĐ)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                className="rounded-xl h-12 bg-gray-50/50 text-base"
                                placeholder="VD: 500000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-bold text-gray-700">Trạng thái hiển thị</Label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="flex h-12 w-full rounded-xl border border-input bg-gray-50/50 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-gray-700"
                            >
                                <option value="Hoạt động">Công khai (Hoạt động)</option>
                                <option value="Tạm ngưng">Bản nháp / Tạm ngưng</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Detailed Description */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-6 relative z-10">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Mô Tả Chi Tiết</h2>
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="description" className="text-sm font-bold text-gray-700">Mô tả thêm về hạng mục bảo dưỡng, các quy trình tiêu chuẩn...</Label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="flex min-h-[200px] w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-base outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-gray-700 resize-none"
                            placeholder="Ví dụ: Thay dầu động cơ, kiểm tra lọc nhớt, đo áp suất lốp, châm nước làm mát..."
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-4 pb-12">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsEditOpen(false)}
                        className="h-14 px-8 rounded-xl font-bold text-gray-500 hover:bg-gray-100"
                    >
                        Hủy Bỏ / Quay Lại
                    </Button>
                    <Button
                        onClick={handleEdit}
                        disabled={isSubmitting}
                        className="h-14 px-10 rounded-xl font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 text-white gap-2 transition-all active:scale-95 text-lg"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        Lưu Cập Nhật
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
