"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Wrench, ShieldCheck, Edit, Trash2, Loader2, Save } from "lucide-react";
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
  const [maintenanceServices, setMaintenanceServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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
      toast.error('Không thể tải danh sách dịch vụ bảo dưỡng');
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

  const ServiceForm = () => (
      <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto px-1">
          <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold">Tên dịch vụ</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} className="rounded-xl h-11" placeholder="VD: Gói bảo dưỡng cấp 1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-bold">Giá dự kiến (VNĐ)</Label>
                  <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className="rounded-xl h-11" placeholder="500000" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-bold">Trạng thái</Label>
                  <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                      <option value="Hoạt động">Hoạt động</option>
                      <option value="Tạm ngưng">Tạm ngưng</option>
                  </select>
              </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-bold">Mô tả thêm</Label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Nhập các hạng mục bảo dưỡng..." />
          </div>
      </div>
  );

  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-body space-y-8">
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

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
              <DialogHeader className="bg-emerald-600 px-10 py-8 text-white">
                  <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Cập nhật dịch vụ</DialogTitle>
              </DialogHeader>
              <div className="p-10"><ServiceForm /></div>
              <DialogFooter className="bg-gray-50 px-10 py-6">
                  <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl font-bold">Hủy</Button>
                  <Button onClick={handleEdit} disabled={isSubmitting} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-8 font-black text-white">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cập nhật ngay"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

    </div>
  );
}
