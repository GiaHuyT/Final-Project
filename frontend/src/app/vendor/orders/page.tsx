'use client';

import { useEffect, useState } from 'react';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import OrdersTab from '@/components/vendor/OrdersTab';

export default function VendorOrdersPage() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await http.get('/orders/vendor/me');
            setOrders(data || []);
        } catch (error) {
            console.error('Fetch Orders Error:', error);
            toast.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h1>
            <OrdersTab orders={orders} onRefresh={fetchOrders} />
        </div>
    );
}
