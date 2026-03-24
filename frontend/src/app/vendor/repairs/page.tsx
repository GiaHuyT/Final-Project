'use client';

import { useEffect, useState } from 'react';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import RepairsTab from '@/components/vendor/RepairsTab';

export default function VendorRepairsPage() {
    const [loading, setLoading] = useState(true);
    const [repairs, setRepairs] = useState<any[]>([]);

    const fetchRepairs = async () => {
        try {
            setLoading(true);
            const { data } = await http.get('/repairs/vendor/me');
            setRepairs(data || []);
        } catch (error) {
            console.error('Fetch Repairs Error:', error);
            toast.error('Không thể tải danh sách sửa chữa');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRepairs();
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý sửa chữa</h1>
            <RepairsTab repairs={repairs} onRefresh={fetchRepairs} />
        </div>
    );
}
