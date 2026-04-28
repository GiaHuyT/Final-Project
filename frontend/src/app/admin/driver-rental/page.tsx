"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Search, UserCircle, ShieldCheck, Edit, Trash2, Loader2, Save, Image as ImageIcon, ArrowLeft, Briefcase, FileText } from "lucide-react";
import http from "@/lib/http";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DriverRentalManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [driverServices, setDriverServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const avatarRef = useRef<HTMLInputElement>(null);
  const licenseFrontRef = useRef<HTMLInputElement>(null);
  const licenseBackRef = useRef<HTMLInputElement>(null);
  const idCardFrontRef = useRef<HTMLInputElement>(null);
  const idCardBackRef = useRef<HTMLInputElement>(null);
  const criminalRecordRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
      name: '',
      dob: '',
      experienceYears: '',
      pricePerKm: '',
      status: 'Hoạt động',
      avatarUrl: '',
      licenseFrontUrl: '',
      licenseBackUrl: '',
      idCardFrontUrl: '',
      idCardBackUrl: '',
      criminalRecordUrl: '',
  });

  const [confirmModalState, setConfirmModalState] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
  }>({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {}
  });

  const fetchServices = async () => {
    const mockData = [
        {
            id: 101,
            name: "Nguyễn Trung Kiên",
            dob: "1988-05-12",
            experienceYears: 8,
            pricePerKm: 15000,
            status: "Hoạt động",
            avatarUrl: "https://i.pravatar.cc/150?img=11",
            profile: { user: { username: "kien_driver", email: "kien.nguyen88@gmail.com" } }
        },
        {
            id: 102,
            name: "Trần Bảo Nam",
            dob: "1992-08-20",
            experienceYears: 5,
            pricePerKm: 12000,
            status: "Hoạt động",
            avatarUrl: "https://i.pravatar.cc/150?img=33",
            profile: { user: { username: "nam.tran", email: "namtran92@yahoo.com" } }
        },
        {
            id: 103,
            name: "Lê Minh Tuấn",
            dob: "1985-11-30",
            experienceYears: 12,
            pricePerKm: 18000,
            status: "Hoạt động",
            avatarUrl: "https://i.pravatar.cc/150?img=60",
            profile: { user: { username: "tuan_le_pro", email: "tuanle1985@vn" } }
        },
        {
            id: 104,
            name: "Phạm Hải Đăng",
            dob: "1995-02-15",
            experienceYears: 3,
            pricePerKm: 10000,
            status: "Hoạt động",
            avatarUrl: "https://i.pravatar.cc/150?img=52",
            profile: { user: { username: "haidang95", email: "dang.pham@gmail.com" } }
        },
        {
            id: 105,
            name: "Hoàng Văn Thái",
            dob: "1990-07-07",
            experienceYears: 6,
            pricePerKm: 14000,
            status: "Tạm ngưng",
            avatarUrl: "https://i.pravatar.cc/150?img=14",
            profile: { user: { username: "thai_hoang", email: "thaihoang90@gmail.com" } }
        }
    ];

    try {
      setLoading(true);
      const { data } = await http.get('/driver-rental/public');
      if (data && data.length > 0) {
          setDriverServices(data);
      } else {
          setDriverServices(mockData);
      }
    } catch (error) {
      toast.error('Sử dụng dữ liệu mẫu do không kết nối được API');
      setDriverServices(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadingField(fieldName);
      try {
          const data = new FormData();
          data.append('file', file);
          const res = await http.post('/users/avatar', data, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          setFormData(prev => ({ ...prev, [fieldName]: res.data.avatarUrl }));
          toast.success('Tải ảnh thành công!');
      } catch (error) {
          toast.error('Có lỗi xảy ra khi tải ảnh lên.');
      } finally {
          setUploadingField(null);
          if (event.target) event.target.value = '';
      }
  };

  const openEdit = (service: any) => {
      setSelectedService(service);
      setFormData({
          name: service.name || '',
          dob: service.dob || '',
          experienceYears: service.experienceYears?.toString() || '',
          pricePerKm: service.pricePerKm?.toString() || '',
          status: service.status || 'Hoạt động',
          avatarUrl: service.avatarUrl || '',
          licenseFrontUrl: service.licenseFrontUrl || '',
          licenseBackUrl: service.licenseBackUrl || '',
          idCardFrontUrl: service.idCardFrontUrl || '',
          idCardBackUrl: service.idCardBackUrl || '',
          criminalRecordUrl: service.criminalRecordUrl || '',
      });
      setIsEditOpen(true);
  };

  const handleEdit = async () => {
      if (!formData.name) {
          toast.error('Vui lòng nhập tên đối tác');
          return;
      }
      setIsSubmitting(true);
      try {
          await http.patch(`/driver-rental/${selectedService.id}`, {
              ...formData,
              experienceYears: parseInt(formData.experienceYears) || 0,
              pricePerKm: parseFloat(formData.pricePerKm) || 0,
          });
          toast.success('Cập nhật thông tin thành công');
          setIsEditOpen(false);
          fetchServices();
      } catch (error) {
          toast.error('Có lỗi xảy ra');
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDelete = async (id: number) => {
    setConfirmModalState({
        isOpen: true,
        title: 'Xóa đối tác',
        message: 'Bạn có chắc muốn xóa đối tác này?',
        onConfirm: async () => {
            try {
              await http.delete(`/driver-rental/${id}`);
              toast.success('Xóa thành công');
              fetchServices();
            } catch (error) {
              toast.error('Không thể xóa đối tác');
            }
        }
    });
  };

  const filteredServices = driverServices.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profile?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ImageUploadBox = ({ title, fieldName, refVar }: { title: string, fieldName: keyof typeof formData, refVar: any }) => (
      <div className="space-y-2">
          <Label className="text-xs font-bold text-gray-700">{title}</Label>
          <div
              onClick={() => refVar.current?.click()}
              className="relative h-24 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 hover:border-emerald-300 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group mb-2"
          >
              {formData[fieldName] ? (
                  <img src={formData[fieldName]} className="w-full h-full object-cover" alt={title} />
              ) : (
                  <div className="text-center p-2 text-gray-400 group-hover:text-emerald-500 transition-colors">
                      {uploadingField === fieldName ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-500" />
                      ) : (
                          <>
                              <ImageIcon className="w-5 h-5 mx-auto" />
                              <span className="text-[10px] font-medium block mt-1">Tải ảnh</span>
                          </>
                      )}
                  </div>
              )}
          </div>
          {formData[fieldName] && (
              <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="w-full rounded-lg text-[10px] h-6 py-0"
                  onClick={() => setFormData(prev => ({ ...prev, [fieldName]: '' }))}
              >
                  Xóa
              </Button>
          )}
          <input type="file" ref={refVar} onChange={(e) => handleFileChange(e, fieldName)} accept="image/*" className="hidden" />
      </div>
  );

  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-body space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!isEditOpen ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3 uppercase">
                <UserCircle className="w-8 h-8 text-blue-600" />
                Quản lý Dịch vụ Lái thuê
              </h1>
              <p className="text-slate-500 mt-1 font-medium">
                Quản lý danh sách đối tác cung cấp dịch vụ lái xe thuê trên toàn quốc.
              </p>
            </div>
            <Link href="/admin/driver-rental/add">
                <Button className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-900 transition-colors shadow-sm h-auto">
                    <Plus className="w-5 h-5" /> Thêm đối tác mới
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
                  placeholder="Tìm kiếm tài xế hoặc đơn vị..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-6 w-16">Avatar</th>
                    <th className="px-8 py-6">Đối tác / Tài xế</th>
                    <th className="px-8 py-6">Kinh nghiệm</th>
                    <th className="px-8 py-6 text-center">Giá thuê/Km</th>
                    <th className="px-8 py-6 text-center">Trạng thái</th>
                    <th className="px-8 py-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={6} className="p-16 text-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" /></td></tr>
                  ) : filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-16 text-center text-slate-500">
                        <ShieldCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="font-bold text-lg text-slate-400">Chưa có tài xế nào trong danh sách.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/5 transition-colors group">
                        <td className="px-8 py-6 align-middle">
                            <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-gray-50 flex items-center justify-center">
                                {item.avatarUrl ? (
                                    <img src={item.avatarUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle className="w-8 h-8 text-gray-300" />
                                )}
                            </div>
                        </td>
                        <td className="px-8 py-6 align-middle">
                          <div className="font-black text-gray-900 text-base">{item.name}</div>
                          <div className="text-[11px] font-bold text-gray-400 mt-1">{item.profile?.user?.username} ({item.profile?.user?.email})</div>
                        </td>
                        <td className="px-8 py-6 align-middle">
                          <div className="font-bold text-slate-700">{item.experienceYears} năm</div>
                        </td>
                        <td className="px-8 py-6 align-middle text-center">
                          <div className="font-black text-blue-600">{(item.pricePerKm || 0).toLocaleString('vi-VN')} đ/km</div>
                        </td>
                        <td className="px-8 py-6 align-middle text-center">
                          <Badge className={`rounded-full px-4 py-1 uppercase text-[9px] font-black shadow-sm border-2 ${
                              item.status === 'Hoạt động' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                              {item.status}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 align-middle text-right space-x-2">
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
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Cập Nhật Đối Tác Lái Thuê</h1>
                    <p className="text-muted-foreground font-medium">Chỉnh sửa thông tin tài xế phục vụ cho nhu cầu thuê lái xe.</p>
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <UserCircle className="w-48 h-48" />
                    </div>

                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Thông Tin Tài Xế</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold text-gray-700">Tên tài xế / Đơn vị <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="rounded-xl h-12 bg-gray-50/50 text-base"
                                placeholder="VD: Nguyễn Văn A"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dob" className="text-sm font-bold text-gray-700">Ngày tháng năm sinh</Label>
                            <Input
                                id="dob"
                                name="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                                className="rounded-xl h-12 bg-gray-50/50 text-base"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="experienceYears" className="text-sm font-bold text-gray-700">Số năm kinh nghiệm</Label>
                            <Input
                                id="experienceYears"
                                name="experienceYears"
                                type="number"
                                min="0"
                                value={formData.experienceYears}
                                onChange={handleChange}
                                className="rounded-xl h-12 bg-gray-50/50 text-base"
                                placeholder="VD: 5"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pricePerKm" className="text-sm font-bold text-gray-700">Giá thuê (VNĐ/Km)</Label>
                            <Input
                                id="pricePerKm"
                                name="pricePerKm"
                                type="number"
                                min="0"
                                value={formData.pricePerKm}
                                onChange={handleChange}
                                className="rounded-xl h-12 bg-gray-50/50 text-base"
                                placeholder="VD: 15000"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="status" className="text-sm font-bold text-gray-700">Trạng thái hồ sơ</Label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="flex h-12 w-full rounded-xl border border-input bg-gray-50/50 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium text-gray-700"
                            >
                                <option value="Hoạt động">Công khai (Khách hàng có thể thấy)</option>
                                <option value="Tạm ngưng">Bản nháp / Đang bận</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-8 relative z-10">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Hình Ảnh & Giấy Tờ</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ImageUploadBox title="Ảnh chân dung" fieldName="avatarUrl" refVar={avatarRef} />
                        <ImageUploadBox title="Lý lịch tư pháp" fieldName="criminalRecordUrl" refVar={criminalRecordRef} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <ImageUploadBox title="GPLX (Mặt trước)" fieldName="licenseFrontUrl" refVar={licenseFrontRef} />
                        <ImageUploadBox title="GPLX (Mặt sau)" fieldName="licenseBackUrl" refVar={licenseBackRef} />
                        <ImageUploadBox title="CCCD (Mặt trước)" fieldName="idCardFrontUrl" refVar={idCardFrontRef} />
                        <ImageUploadBox title="CCCD (Mặt sau)" fieldName="idCardBackUrl" refVar={idCardBackRef} />
                    </div>
                </div>

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
                        disabled={isSubmitting || uploadingField !== null}
                        className="h-14 px-10 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 text-white gap-2 transition-all active:scale-95 text-lg"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        Lưu Thông Tin
                    </Button>
                </div>
            </div>
        </div>
      )}

      <Dialog open={confirmModalState.isOpen} onOpenChange={(open) => setConfirmModalState(prev => ({ ...prev, isOpen: open }))}>
          <DialogContent className="max-w-md rounded-[2.5rem] p-10 text-center border-none shadow-3xl bg-white">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-10 h-10" />
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">{confirmModalState.title}</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium mb-8 text-base">
                  {confirmModalState.message}
              </DialogDescription>
              <div className="flex flex-col gap-3">
                  <Button
                      onClick={() => {
                          confirmModalState.onConfirm();
                          setConfirmModalState(prev => ({ ...prev, isOpen: false }));
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-600/20"
                  >
                      Xác nhận
                  </Button>
                  <Button
                      variant="ghost"
                      onClick={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
                      className="w-full h-12 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                      Hủy bỏ
                  </Button>
              </div>
          </DialogContent>
      </Dialog>

    </div>
  );
}
