"use client";

import React, { useEffect, useState } from "react";
import http from "@/lib/http";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Check, X, Clock, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AuctionRegistrationsModalProps {
  auctionId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function AuctionRegistrationsModal({
  auctionId,
  isOpen,
  onClose,
  onUpdate,
}: AuctionRegistrationsModalProps) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [auction, setAuction] = useState<any>(null);

  useEffect(() => {
    if (isOpen && auctionId) {
      fetchData();
    } else {
      setRegistrations([]);
      setAuction(null);
    }
  }, [isOpen, auctionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [regRes, auctionRes] = await Promise.all([
        http.get(`/auctions/${auctionId}/registrations`),
        http.get(`/auctions/${auctionId}`),
      ]);

      setRegistrations(regRes.data);
      setAuction(auctionRes.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách đăng ký");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (regId: number, action: "approve" | "reject") => {
    try {
      await http.post(`/auctions/${auctionId}/registrations/${regId}/${action}`);
      toast.success(action === "approve" ? "Đã duyệt yêu cầu!" : "Đã từ chối yêu cầu!");
      fetchData();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Lỗi không thể thực hiện thao tác này");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl font-bold font-headline">
            Quản lý người tham gia
          </DialogTitle>
          <DialogDescription className="mt-1">
            Phiên: <span className="font-bold text-slate-900">{auction?.title || "..."}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-0">
          {loading && registrations.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Đang tải danh sách...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold sticky top-0 z-10">
                    <th className="px-6 py-4">Người đăng ký</th>
                    <th className="px-6 py-4">Liên hệ</th>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <HelpCircle className="w-8 h-8 text-slate-300" />
                          <p>Chưa có ai đăng ký tham gia phiên này.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                reg.user.avatar ||
                                `https://ui-avatars.com/api/?name=${reg.user.username}`
                              }
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              alt=""
                            />
                            <div>
                              <p className="font-bold text-slate-800">{reg.user.username}</p>
                              <p className="text-xs text-slate-500">ID: #{reg.userId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-600 truncate max-w-[150px]" title={reg.user.email}>{reg.user.email || "N/A"}</p>
                          <p className="text-slate-600">{reg.user.phonenumber || "N/A"}</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600 text-[12px]">
                          {format(new Date(reg.createdAt), "HH:mm dd/MM/yyyy")}
                        </td>
                        <td className="px-6 py-4">
                          {reg.status === "PENDING" && (
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">
                              <Clock className="w-3 h-3 mr-1" /> Chờ
                            </Badge>
                          )}
                          {reg.status === "APPROVED" && (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                              <Check className="w-3 h-3 mr-1" /> Duyệt
                            </Badge>
                          )}
                          {reg.status === "REJECTED" && (
                            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none">
                              <X className="w-3 h-3 mr-1" /> Từ chối
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {reg.status === "PENDING" && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                onClick={() => handleAction(reg.id, "approve")}
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-none h-8 px-3"
                              >
                                <Check className="w-4 h-4 mr-1" /> Duyệt
                              </Button>
                              <Button
                                onClick={() => handleAction(reg.id, "reject")}
                                size="sm"
                                variant="outline"
                                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 h-8 px-3"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {reg.status !== "PENDING" && (
                            <span className="text-xs text-slate-400 italic">Đã xử lý</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
