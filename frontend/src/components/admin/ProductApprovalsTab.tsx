"use client";

import React, { useEffect, useState } from 'react';
import {
    Search,
    Package,
    Loader2,
    Eye,
    CheckCircle2,
    XCircle,
    Tag,
    User,
    Calendar,
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

interface Product {
    id: number;
    name: string;
    brand: string;
    modelName: string;
    price: number;
    status: boolean;
    createdAt: string;
    vendor: {
        username: string;
        email: string;
    };
    category: {
        name: string;
    };
    images: { url: string }[];
}

export function ProductApprovalsTab() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const fetchPendingProducts = async () => {
        try {
            setLoading(true);
            const response = await http.get('/products?status=false');
            setProducts(response.data);
        } catch (error: any) {
            console.error("Lỗi khi lấy danh sách sản phẩm chờ duyệt:", error);
            toast.error("Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingProducts();
    }, []);

    const handleApprove = async (productId: number) => {
        try {
            await http.patch(`/products/${productId}/status`, { status: true });
            toast.success("Đã phê duyệt sản phẩm");
            fetchPendingProducts();
        } catch (error) {
            toast.error("Phê duyệt thất bại");
        }
    };

    const handleDecline = async (productId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn từ chối và xóa sản phẩm này?")) return;
        try {
            await http.delete(`/products/${productId}`);
            toast.success("Đã xóa sản phẩm bị từ chối");
            fetchPendingProducts();
        } catch (error) {
            toast.error("Thao tác thất bại");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.modelName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase tracking-tighter">Phê duyệt Sản phẩm</h1>
                <p className="text-muted-foreground font-medium">
                    Danh sách sản phẩm mới đang chờ kiểm duyệt nội dung và thông tin.
                </p>
            </div>

            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="border-b bg-gray-50/30 px-10 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-widest text-gray-800">Sản phẩm chờ duyệt</CardTitle>
                            <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-1">Tổng cộng: {products.length} sản phẩm</CardDescription>
                        </div>
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                            <Input
                                type="search"
                                placeholder="Tìm tên, hãng, dòng xe..."
                                className="pl-12 h-12 rounded-2xl bg-white border-gray-100 focus:ring-4 focus:ring-blue-100 font-bold transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex h-80 items-center justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-gray-100/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b">
                                    <tr>
                                        <th className="px-10 py-6">Sản phẩm</th>
                                        <th className="px-10 py-6">Nhà cung cấp</th>
                                        <th className="px-10 py-6">Giá niêm yết</th>
                                        <th className="px-10 py-6 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-10 py-24 text-center">
                                                <p className="text-gray-400 font-bold italic">Không có sản phẩm nào đang chờ phê duyệt.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-blue-50/10 transition-all group">
                                                <td className="px-10 py-6 align-middle">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-16 w-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                            {product.images && product.images[0] ? (
                                                                <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package className="h-6 w-6 text-gray-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-gray-900 leading-tight">{product.name}</span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="outline" className="text-[9px] font-black uppercase px-2 py-0 border-blue-100 text-blue-600 bg-blue-50/30">
                                                                    {product.brand}
                                                                </Badge>
                                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{product.category.name}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-black uppercase shadow-inner">
                                                            {product.vendor.username.substring(0, 2)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-800 text-xs">{product.vendor.username}</span>
                                                            <span className="text-[10px] text-gray-400">{product.vendor.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 align-middle">
                                                    <span className="font-black text-blue-600 text-base">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 align-middle text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            onClick={() => { setSelectedProduct(product); setIsViewOpen(true); }}
                                                            className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 transition-all text-gray-400 hover:text-blue-600"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleDecline(product.id)}
                                                            className="h-10 w-10 p-0 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-none transition-all"
                                                        >
                                                            <XCircle className="h-5 w-5" />
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleApprove(product.id)}
                                                            className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 border-none transition-all shadow-lg shadow-blue-100 flex items-center gap-2 font-black text-xs uppercase"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Duyệt
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[720px] p-0 border-none shadow-3xl rounded-[2rem] overflow-hidden overflow-y-auto max-h-[90vh]">
                    <div className="relative h-72 bg-gray-200">
                        {selectedProduct?.images && selectedProduct.images[0] ? (
                            <img src={selectedProduct.images[0].url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-12 w-12 text-gray-400" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                            <Badge className="w-fit mb-3 bg-blue-600 border-none">{selectedProduct?.category.name}</Badge>
                            <h2 className="text-3xl font-black text-white leading-tight">{selectedProduct?.name}</h2>
                        </div>
                    </div>
                    
                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                                <Tag className="h-5 w-5 text-blue-600 mb-2" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Hãng xe</p>
                                <p className="font-bold text-gray-900">{selectedProduct?.brand}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                                <Package className="h-5 w-5 text-blue-600 mb-2" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Dòng xe</p>
                                <p className="font-bold text-gray-900">{selectedProduct?.modelName}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                                <DollarSign className="h-5 w-5 text-blue-600 mb-2" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Giá bán</p>
                                <p className="font-bold text-gray-900 truncate w-full">
                                    {selectedProduct && new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                                <Calendar className="h-5 w-5 text-blue-600 mb-2" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Ngày tạo</p>
                                <p className="font-bold text-gray-900">
                                    {selectedProduct && new Date(selectedProduct.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest border-l-4 border-blue-600 pl-3">Nhà cung cấp</h4>
                            <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black">
                                    {selectedProduct?.vendor.username.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-black text-gray-900">{selectedProduct?.vendor.username}</p>
                                    <p className="text-xs text-gray-500">{selectedProduct?.vendor.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsViewOpen(false)} 
                                className="flex-1 rounded-[1.2rem] h-14 font-black border-gray-200"
                            >
                                Đóng
                            </Button>
                            <Button 
                                onClick={() => { handleDecline(selectedProduct!.id); setIsViewOpen(false); }}
                                className="flex-1 rounded-[1.2rem] h-14 font-black bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-none shadow-none"
                            >
                                <XCircle className="h-5 w-5 mr-2" />
                                Từ chối & Xóa
                            </Button>
                            <Button 
                                onClick={() => { handleApprove(selectedProduct!.id); setIsViewOpen(false); }}
                                className="flex-[2] rounded-[1.2rem] h-14 font-black bg-blue-600 text-white hover:bg-blue-700 border-none shadow-xl shadow-blue-100"
                            >
                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                Phê duyệt Sản phẩm
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
