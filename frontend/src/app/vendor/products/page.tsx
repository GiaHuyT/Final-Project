'use client';

import { useEffect, useState } from 'react';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import ProductsTab from '@/components/vendor/ProductsTab';

export default function VendorProductsPage() {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<any[]>([]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await http.get('/products/vendor/me');
            setProducts(data || []);
        } catch (error) {
            console.error('Fetch Products Error:', error);
            toast.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý sản phẩm</h1>
            <ProductsTab products={products} onRefresh={fetchProducts} />
        </div>
    );
}
