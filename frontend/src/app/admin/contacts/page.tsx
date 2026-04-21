"use client";

import React, { useState, useEffect } from "react";
import http from "@/lib/http";
import { CheckCircle, Clock, Mail, Phone, Search } from "lucide-react";
import toast from "react-hot-toast";
import { getSocket } from "@/lib/socket";

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const { data } = await http.get('/contacts');
      setContacts(data);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();

    const socket = getSocket('notifications');
    if (socket) {
      const handleNotification = (notif: any) => {
        if (notif.link === '/admin/contacts') {
          fetchContacts();
        }
      };
      socket.on('notification', handleNotification);
      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, []);

  const handleResolve = async (id: number) => {
    try {
      await http.patch(`/contacts/${id}/status`, { status: 'RESOLVED' });
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status: 'RESOLVED' } : c));
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi cập nhật trạng thái.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Yêu cầu hỗ trợ</h1>
        <p className="text-slate-500 mt-2">Quản lý các yêu cầu liên hệ, thắc mắc và góp ý từ khách hàng.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {contacts.length === 0 ? (
           <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
             <p className="text-slate-500">Chưa có yêu cầu hỗ trợ nào.</p>
           </div>
        ) : (
          contacts.map((contact) => (
            <div 
              key={contact.id} 
              className={`bg-white rounded-2xl shadow-sm border ${contact.status === 'RESOLVED' ? 'border-emerald-100' : 'border-slate-200'} p-6 transition-all hover:shadow-md`}
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Info block */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-slate-900">{contact.name}</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      Chủ đề: {
                        contact.subject === 'vendor_support' ? 'Đăng ký nhà cung cấp' :
                        contact.subject === 'account' ? 'Hỗ trợ tài khoản' :
                        contact.subject === 'report' ? 'Báo cáo vi phạm' :
                        contact.subject === 'feedback' ? 'Góp ý hệ thống' :
                        contact.subject === 'maintenance' ? 'Sửa chữa / Bảo dưỡng' :
                        contact.otherSubject || 'Khác'
                      }
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                       <Mail className="w-4 h-4 text-slate-400" />
                       <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors">{contact.email}</a>
                    </div>
                    <div className="flex items-center gap-2">
                       <Phone className="w-4 h-4 text-slate-400" />
                       <a href={`tel:${contact.phone}`} className="hover:text-primary transition-colors">{contact.phone}</a>
                    </div>
                    <div className="flex items-center gap-2">
                       <Clock className="w-4 h-4 text-slate-400" />
                       {new Date(contact.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 text-slate-700 text-sm leading-relaxed border border-slate-100">
                    {contact.message}
                  </div>
                </div>

                {/* Status action block */}
                <div className="shrink-0 flex lg:flex-col items-center justify-between lg:justify-start gap-4 lg:w-48 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-6">
                  {contact.status === 'RESOLVED' ? (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full w-full justify-center">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-bold text-sm">Đã xử lý</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full w-full justify-center">
                        <Clock className="w-5 h-5" />
                        <span className="font-bold text-sm">Đang chờ xử lý</span>
                      </div>
                      <button 
                        onClick={() => handleResolve(contact.id)}
                        className="w-full bg-slate-900 text-white font-bold text-sm py-2 px-4 rounded-xl hover:bg-primary transition-colors hover:shadow-lg shadow-slate-900/20 active:scale-95"
                      >
                        Đánh dấu đã xong
                      </button>
                    </>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
