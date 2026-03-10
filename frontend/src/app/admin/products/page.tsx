"use client";

import React, { useEffect, useState } from 'react';
import {
    Search,
    Plus,
    MoreHorizontal,
    Filter,
    Package,
    Tag,
    Store,
    Eye,
    Loader2
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import http from '@/lib/http';
import { toast } from 'react-hot-toast';

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    status: boolean;
    category: { name: string };
    vendor: { username: string };
    createdAt: string;
}

export default function ProductManagementPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await http.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm:", error);
            toast.error("Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleToggleStatus = async (productId: number, currentStatus: boolean) => {
        try {
            await http.patch(`/products/${productId}/status`, { status: !currentStatus });
            toast.success("Cập nhật trạng thái thành công");
            fetchProducts();
        } catch (error) {
            toast.error("Cập nhật trạng thái thất bại");
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
                    <p className="text-muted-foreground">Theo dõi và quản lý kho hàng, giá cả và danh mục sản phẩm.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Bộ lọc
                    </Button>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Thêm sản phẩm
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Tất cả sản phẩm</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Tìm sản phẩm, thương hiệu..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Sản phẩm</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Danh mục</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Người bán</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Giá</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Kho</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Trạng thái</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                                Không tìm thấy sản phẩm nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <tr key={product.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-md bg-primary/10 p-2">
                                                            <Package className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <span className="font-medium">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Badge variant="outline" className="gap-1 font-normal">
                                                        <Tag className="h-3 w-3" />
                                                        {product.category.name}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-1.5">
                                                        <Store className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span>{product.vendor.username}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle font-medium">
                                                    {product.price.toLocaleString()} ₫
                                                </td>
                                                <td className="p-4 align-middle">
                                                    {product.stock}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Badge
                                                        variant={
                                                            product.status ? (product.stock > 10 ? "default" : "secondary") : "destructive"
                                                        }
                                                    >
                                                        {product.status ? (product.stock > 10 ? 'Còn hàng' : 'Sắp hết') : 'Đang ẩn'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                            <DropdownMenuItem className="gap-2">
                                                                <Eye className="h-4 w-4" />
                                                                Xem chi tiết
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className={product.status ? "text-destructive" : "text-green-600"}
                                                                onClick={() => handleToggleStatus(product.id, product.status)}
                                                            >
                                                                {product.status ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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
        </div>
    );
}
