"use client";

import React, { useState, useEffect } from "react";
import { Search, UserCircle, ShieldCheck, Loader2, CheckCircle, XCircle, Eye } from "lucide-react";
import http from "@/lib/http";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function DriverApprovalsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [driverServices, setDriverServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    try {
      setLoading(true);
      const res = await http.get('/driver-rental/public');
      setDriverServices(res.data);
    } catch (error) {
      toast.error('Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleApproveDriver = async (service: any, isApproved: boolean) => {
    const executeAction = async () => {
        try {
            setIsSubmitting(true);
            const userId = service.profile?.user?.id;
            if (userId) {
                await http.patch(`/users/${userId}/approve-driver`, { isApproved });
            }
            if (isApproved) {
                await http.patch(`/driver-rental/${service.id}`, { status: 'Hoạt động' });
                toast.success('Đã phê duyệt tài xế');
            } else {
                await http.delete(`/driver-rental/${service.id}`);
                toast.success('Đã từ chối tài xế');
            }
            fetchServices();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xử lý');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isApproved) {
        executeAction();
    } else {
        setConfirmModalState({
            isOpen: true,
            title: 'Từ chối Tài xế',
            message: 'Bạn có chắc muốn TỪ CHỐI tài xế này?',
            onConfirm: executeAction
        });
    }
  };

  const pendingServices = driverServices.filter(s => 
    s.status === 'Chờ duyệt' && 
    (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.profile?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <h2 className="text-xl font-black text-slate-900">Hồ sơ chờ phê duyệt</h2>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
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
                <th className="px-8 py-6">Người đăng ký</th>
                <th className="px-8 py-6">Kinh nghiệm</th>
                <th className="px-8 py-6 text-center">Tài liệu</th>
                <th className="px-8 py-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-16 text-center"><Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto" /></td></tr>
              ) : pendingServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-slate-500">
                    <ShieldCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="font-bold text-lg text-slate-400">Không có hồ sơ nào đang chờ duyệt.</p>
                  </td>
                </tr>
              ) : (
                pendingServices.map((item) => (
                  <tr key={item.id} className="hover:bg-orange-50/10 transition-colors group">
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
                      <div className="text-[10px] text-slate-400 mt-1">Số điện thoại: {item.phoneNumber || 'N/A'}</div>
                    </td>
                    <td className="px-8 py-6 align-middle">
                      <div className="font-bold text-slate-700">{item.experienceYears} năm</div>
                    </td>
                    <td className="px-8 py-6 align-middle text-center">
                       <Button size="sm" variant="outline" onClick={() => {
                           setSelectedService(item);
                           setIsViewOpen(true);
                       }} className="rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 border-blue-100 h-8">
                           <Eye className="w-3.5 h-3.5 mr-1.5" /> Xem hồ sơ
                       </Button>
                    </td>
                    <td className="px-8 py-6 align-middle text-right space-x-2">
                      <Button size="sm" onClick={() => handleApproveDriver(item, true)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 px-4">
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Duyệt
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleApproveDriver(item, false)} className="rounded-xl text-red-600 border-red-100 hover:bg-red-50 font-bold h-8 px-4">
                          <XCircle className="w-3.5 h-3.5 mr-1.5" /> Từ chối
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
              <DialogHeader className="bg-slate-900 px-10 py-8 text-white">
                  <DialogTitle className="text-2xl font-black tracking-tighter">Chi tiết hồ sơ: {selectedService?.name}</DialogTitle>
                  <DialogDescription className="text-slate-400 mt-2">Xem xét kỹ các tài liệu trước khi phê duyệt.</DialogDescription>
              </DialogHeader>
              <div className="p-10 max-h-[60vh] overflow-y-auto space-y-6 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                          <h3 className="font-bold text-slate-800 border-b pb-2">Thông tin cơ bản</h3>
                          <p className="text-sm"><strong>Họ tên:</strong> {selectedService?.name}</p>
                          <p className="text-sm"><strong>CCCD:</strong> {selectedService?.idCardNumber}</p>
                          <p className="text-sm"><strong>SĐT:</strong> {selectedService?.phoneNumber}</p>
                          <p className="text-sm"><strong>Email:</strong> {selectedService?.email}</p>
                          <p className="text-sm"><strong>Ngân hàng:</strong> {selectedService?.bankName} - {selectedService?.bankAccountNumber} ({selectedService?.bankAccountName})</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                          <h3 className="font-bold text-slate-800 border-b pb-2">Kinh nghiệm & GPLX</h3>
                          <p className="text-sm"><strong>Kinh nghiệm:</strong> {selectedService?.experienceYears} năm</p>
                          <p className="text-sm"><strong>Hạng GPLX:</strong> {selectedService?.licenseType}</p>
                          <p className="text-sm"><strong>Số GPLX:</strong> {selectedService?.licenseNumber}</p>
                          <p className="text-sm"><strong>Giá thuê:</strong> {(selectedService?.pricePerKm || 0).toLocaleString()} VNĐ/km</p>
                      </div>
                  </div>
                  
                  <h3 className="font-bold text-slate-800 mt-8 mb-4">Tài liệu đính kèm</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedService?.idCardFrontUrl && (
                          <div className="border rounded-xl p-2 bg-white"><p className="text-xs font-bold mb-2 text-center text-slate-600">CCCD (Mặt trước)</p><img src={selectedService.idCardFrontUrl} className="w-full h-32 object-contain rounded-lg bg-slate-50" /></div>
                      )}
                      {selectedService?.idCardBackUrl && (
                          <div className="border rounded-xl p-2 bg-white"><p className="text-xs font-bold mb-2 text-center text-slate-600">CCCD (Mặt sau)</p><img src={selectedService.idCardBackUrl} className="w-full h-32 object-contain rounded-lg bg-slate-50" /></div>
                      )}
                      {selectedService?.licenseFrontUrl && (
                          <div className="border rounded-xl p-2 bg-white"><p className="text-xs font-bold mb-2 text-center text-slate-600">GPLX (Mặt trước)</p><img src={selectedService.licenseFrontUrl} className="w-full h-32 object-contain rounded-lg bg-slate-50" /></div>
                      )}
                      {selectedService?.licenseBackUrl && (
                          <div className="border rounded-xl p-2 bg-white"><p className="text-xs font-bold mb-2 text-center text-slate-600">GPLX (Mặt sau)</p><img src={selectedService.licenseBackUrl} className="w-full h-32 object-contain rounded-lg bg-slate-50" /></div>
                      )}
                      {selectedService?.criminalRecordUrl && (
                          <div className="border rounded-xl p-2 bg-white"><p className="text-xs font-bold mb-2 text-center text-slate-600">Lý lịch tư pháp</p><img src={selectedService.criminalRecordUrl} className="w-full h-32 object-contain rounded-lg bg-slate-50" /></div>
                      )}
                  </div>
              </div>
              <DialogFooter className="bg-white px-10 py-6 border-t">
                  <Button variant="ghost" onClick={() => setIsViewOpen(false)} className="rounded-xl font-bold">Đóng</Button>
                  <Button onClick={() => { setIsViewOpen(false); handleApproveDriver(selectedService, true); }} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-8 font-black text-white ml-2">
                      <CheckCircle className="w-4 h-4 mr-2" /> Phê duyệt ngay
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

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
