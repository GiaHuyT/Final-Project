import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import http from '@/lib/http';

interface OrdersTabProps {
    orders: any[];
    onRefresh: () => void;
}

export default function OrdersTab({ orders, onRefresh }: OrdersTabProps) {
    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Quản lý đơn hàng</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th scope="col" className="px-6 py-3">Mã ĐH</th>
                            <th scope="col" className="px-6 py-3">Khách hàng</th>
                            <th scope="col" className="px-6 py-3">Ngày đặt</th>
                            <th scope="col" className="px-6 py-3">Tổng tiền</th>
                            <th scope="col" className="px-6 py-3">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Chưa có đơn hàng nào.</td></tr>
                        )}
                        {orders.map((ord) => (
                            <tr key={ord.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">#{ord.id}</td>
                                <td className="px-6 py-4">{ord.customer?.username || 'Khách vãng lai'}</td>
                                <td className="px-6 py-4">{new Date(ord.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td className="px-6 py-4 font-semibold text-orange-600">{ord.totalPrice.toLocaleString('vi-VN')}đ</td>
                                <td className="px-6 py-4">
                                    <select
                                        value={ord.status}
                                        onChange={async (e) => {
                                            const newStatus = e.target.value;
                                            try {
                                                await http.patch(`/orders/${ord.id}/status`, { status: newStatus });
                                                toast.success('Cập nhật trạng thái đơn hàng thành công');
                                                onRefresh();
                                            } catch (err) {
                                                toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
                                            }
                                        }}
                                        className={`px-2 py-1 rounded-full text-xs font-bold border-none cursor-pointer focus:ring-0
                                            ${ord.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                ord.status === 'SHIPPING' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}
                                    >
                                        <option value="PENDING" className="bg-white text-gray-900">PENDING</option>
                                        <option value="PROCESSING" className="bg-white text-gray-900">PROCESSING</option>
                                        <option value="SHIPPING" className="bg-white text-gray-900">SHIPPING</option>
                                        <option value="COMPLETED" className="bg-white text-gray-900">COMPLETED</option>
                                        <option value="CANCELLED" className="bg-white text-gray-900">CANCELLED</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
