"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Wrench, ShieldCheck } from "lucide-react";
import http from "@/lib/http";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface RepairCapacity {
  id: number;
  name: string;
  specialty: string;
  experienceYears: number;
  vehicleTypes: string;
  brands: string;
  status: string;
  createdAt: string;
  profile: {
    user: {
      id: number;
      username: string;
      email: string;
    }
  }
}

export default function RepairCapacityManagement() {
  const [capacities, setCapacities] = useState<RepairCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCapacities = async () => {
    try {
      setLoading(true);
      // Lấy toàn bộ năng lực (nếu là Admin) hoặc gọi api riêng tùy logic role.
      // Dùng tạm public endpoint để admin xem được tất cả
      const { data } = await http.get('/repairs/capacity/public');
      setCapacities(data);
    } catch (error) {
      console.error("Failed to fetch capacities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapacities();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ năng lực này không?")) {
      try {
        await http.delete(`/repairs/capacity/${id}`);
        fetchCapacities();
      } catch (error) {
        console.error("Failed to delete capacity:", error);
        alert("Có lỗi xảy ra khi xóa.");
      }
    }
  };

  const filteredCapacities = capacities.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.profile?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-body">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900 tracking-tight flex items-center gap-3">
            <Wrench className="w-8 h-8 text-primary" />
            Quản lý đội Sửa chữa / Cứu hộ
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý danh sách các hồ sơ năng lực cứu hộ lưu động và sửa chữa trên hệ thống.
          </p>
        </div>
        <Link 
          href="/admin/repairs/capacity/add" 
          className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-900 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm mới hồ sơ
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
              placeholder="Tìm kiếm theo Tên, Chuyên môn, Người đăng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm font-semibold text-slate-500">
            Tổng cộng: {filteredCapacities.length} hồ sơ
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Hồ sơ năng lực</th>
                <th className="p-4">Nhà cung cấp</th>
                <th className="p-4 text-center">Năm Kinh Nghiệm</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right pr-6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Wrench className="w-8 h-8 animate-spin text-slate-300 mb-2" />
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : filteredCapacities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    Không tìm thấy hồ sơ năng lực nào.
                  </td>
                </tr>
              ) : (
                filteredCapacities.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-900 line-clamp-1">{item.name}</div>
                      <div className="text-sm text-slate-500 mt-0.5 line-clamp-1">{item.specialty}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700">{item.profile?.user?.username || 'N/A'}</div>
                      <div className="text-xs text-slate-400">{item.profile?.user?.email}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block bg-slate-100 text-slate-700 w-8 h-8 rounded-full leading-8 font-bold text-xs border border-slate-200">
                        {item.experienceYears}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-body capitalize bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                        {/* 
                          Hiện tại chưa có route edit riêng biệt trong yêu cầu (đây là mockup nút edit, có thể bỏ nếu không có).
                          Nút xóa được đảm bảo hoạt động. 
                        */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Xóa hồ sơ này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
