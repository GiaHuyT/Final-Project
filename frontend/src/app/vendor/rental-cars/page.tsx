'use client';

import { useEffect, useState } from 'react';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import RentalCarsTab from '@/components/vendor/RentalCarsTab';

export default function VendorRentalCarsPage() {
    const [loading, setLoading] = useState(true);
    const [rentals, setRentals] = useState<any[]>([]);

    const fetchRentals = async () => {
        try {
            setLoading(true);
            const { data } = await http.get('/rental-cars/vendor/me');
            setRentals(data || []);
        } catch (error) {
            console.error('Fetch Rentals Error:', error);
            toast.error('Không thể tải danh sách xe thuê');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRentals();
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý xe thuê</h1>
            <RentalCarsTab rentalCars={rentals} onRefresh={fetchRentals} />
        </div>
    );
}
