"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Loader2, ArrowLeft, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorCreateInvoicePage() {
    const router = useRouter();
    const [vendorProducts, setVendorProducts] = useState<any[]>([]);
    const [newInvoiceData, setNewInvoiceData] = useState({
        productId: '',
        customerId: null as number | null,
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        price: '',
        status: 'PAID'
    });
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
    const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [selectedProductPrice, setSelectedProductPrice] = useState<number>(0);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await http.get('/products/vendor/me');
                setVendorProducts(response.data || []);
            } catch (error) {
                toast.error("Không thể tải danh sách sản phẩm");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (newInvoiceData.customerName.trim() && showCustomerDropdown && !newInvoiceData.customerId) {
                setIsSearchingCustomer(true);
                try {
                    const res = await http.get(`/users/search?q=${encodeURIComponent(newInvoiceData.customerName)}`);
                    setCustomerSearchResults(res.data);
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsSearchingCustomer(false);
                }
            } else {
                setCustomerSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [newInvoiceData.customerName, showCustomerDropdown, newInvoiceData.customerId]);

    const handleCreateInvoice = async () => {
        if (!newInvoiceData.productId) {
            toast.error('Vui lòng chọn xe');
            return;
        }
        
        try {
            setIsCreating(true);
            await http.post('/orders/vendor/manual', {
                productId: parseInt(newInvoiceData.productId),
                customerId: newInvoiceData.customerId,
                customerName: newInvoiceData.customerName,
                price: newInvoiceData.price ? parseInt(newInvoiceData.price) : undefined,
                status: newInvoiceData.status
            });
            toast.success('Lên hóa đơn thành công!');
            router.push('/vendor/orders');
        } catch (error) {
            toast.error('Lên hóa đơn thất bại');
        } finally {
            setIsCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <Link href="/vendor/orders" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors mb-8">
                <ArrowLeft className="w-4 h-4" /> Quay lại Quản lý hóa đơn
            </Link>

            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
                <div className="flex items-center gap-5 mb-8 border-b border-gray-100 pb-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 shrink-0">
                        <ShoppingBag className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Lên Hóa Đơn Khách Hàng</h1>
                        <p className="font-medium text-gray-500">Tạo hóa đơn cho khách mua xe trực tiếp tại Showroom của bạn</p>
                    </div>
                </div>

                <div className="space-y-6 max-w-2xl">
                    <div className="space-y-3 relative">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Khách hàng (Tùy chọn)</label>
                        <input
                            type="text"
                            placeholder="Nhập tên, số điện thoại hoặc email để tìm kiếm..."
                            value={newInvoiceData.customerName}
                            onChange={(e) => {
                                setNewInvoiceData({ ...newInvoiceData, customerName: e.target.value, customerId: null, customerPhone: '', customerEmail: '' });
                                setShowCustomerDropdown(true);
                            }}
                            onFocus={() => setShowCustomerDropdown(true)}
                            onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                            className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium text-base outline-none"
                        />
                        {isSearchingCustomer && (
                            <div className="absolute right-4 top-10">
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            </div>
                        )}
                        {showCustomerDropdown && customerSearchResults.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-60 overflow-y-auto top-[76px]">
                                {customerSearchResults.map(user => (
                                    <li 
                                        key={user.id}
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Prevent input onBlur from firing first
                                            setNewInvoiceData({ 
                                                ...newInvoiceData, 
                                                customerId: user.id, 
                                                customerName: user.username,
                                                customerPhone: user.phonenumber || '',
                                                customerEmail: user.email || ''
                                            });
                                            setShowCustomerDropdown(false);
                                        }}
                                        className="px-5 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                    >
                                        <div className="font-bold text-gray-900">{user.username}</div>
                                        <div className="text-xs text-gray-500">{user.phonenumber} • {user.email}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {newInvoiceData.customerId && (newInvoiceData.customerPhone || newInvoiceData.customerEmail) && (
                        <div className="flex gap-4 text-xs font-medium text-emerald-700 bg-emerald-50 p-4 rounded-2xl border border-emerald-100/50 shadow-sm">
                            {newInvoiceData.customerPhone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {newInvoiceData.customerPhone}</span>}
                            {newInvoiceData.customerEmail && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {newInvoiceData.customerEmail}</span>}
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Chọn Xe <span className="text-red-500">*</span></label>
                        <select
                            value={newInvoiceData.productId}
                            onChange={(e) => {
                                const prod = vendorProducts.find(p => p.id === parseInt(e.target.value));
                                const fullPrice = prod ? prod.price : 0;
                                setSelectedProductPrice(fullPrice);
                                
                                let newPriceStr = '';
                                if (prod) {
                                    if (newInvoiceData.status === 'DEPOSITED') {
                                        newPriceStr = (fullPrice * 0.01).toString(); // 1% cọc
                                    } else {
                                        newPriceStr = fullPrice.toString();
                                    }
                                }

                                setNewInvoiceData({ 
                                    ...newInvoiceData, 
                                    productId: e.target.value,
                                    price: newPriceStr
                                });
                            }}
                            className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium text-base outline-none bg-white"
                        >
                            <option value="">-- Bấm để chọn xe trong kho --</option>
                            {vendorProducts.filter(p => p.status && p.stock > 0).map(p => (
                                <option key={p.id} value={p.id}>{p.name} - Kho: {p.stock} chiếc</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Loại Hóa Đơn <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setNewInvoiceData({ 
                                        ...newInvoiceData, 
                                        status: 'DEPOSITED',
                                        price: selectedProductPrice ? (selectedProductPrice * 0.01).toString() : ''
                                    });
                                }}
                                className={`h-14 rounded-2xl font-black text-base transition-all border-2 uppercase tracking-widest ${newInvoiceData.status === 'DEPOSITED' ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-lg shadow-amber-100' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'}`}
                            >
                                Cọc
                            </button>
                            <button
                                onClick={() => {
                                    setNewInvoiceData({ 
                                        ...newInvoiceData, 
                                        status: 'PAID',
                                        price: selectedProductPrice ? selectedProductPrice.toString() : ''
                                    });
                                }}
                                className={`h-14 rounded-2xl font-black text-base transition-all border-2 uppercase tracking-widest ${newInvoiceData.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-lg shadow-emerald-100' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'}`}
                            >
                                Thanh Toán
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            {newInvoiceData.status === 'DEPOSITED' ? 'Số tiền cọc (VNĐ)' : 'Toàn bộ giá tiền (VNĐ)'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            placeholder="Ví dụ: 2500000000"
                            value={newInvoiceData.price}
                            onChange={(e) => setNewInvoiceData({ ...newInvoiceData, price: e.target.value })}
                            className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-black text-blue-600 text-xl outline-none"
                        />
                        {newInvoiceData.status === 'DEPOSITED' && selectedProductPrice > 0 && (
                            <p className="text-xs text-amber-600 font-bold mt-1">* Hệ thống tự động tính cọc 1% giá trị xe ({selectedProductPrice.toLocaleString('vi-VN')} VNĐ)</p>
                        )}
                    </div>



                    <div className="pt-6">
                        <Button 
                            onClick={handleCreateInvoice}
                            disabled={isCreating || !newInvoiceData.productId || !newInvoiceData.price}
                            className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl hover:shadow-blue-600/30 transition-all"
                        >
                            {isCreating ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Xuất Hóa Đơn'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
