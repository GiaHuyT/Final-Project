"use client";

import React, { useEffect, useState } from 'react';
import {
    Search,
    ShieldCheck,
    Mail,
    Phone,
    Loader2,
    Eye,
    CheckCircle2,
    XCircle,
    User
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

interface UserData {
    id: number;
    username: string;
    email: string | null;
    phonenumber: string | null;
    role: string;
    isApprovedVendor: boolean;
    vendorRequestPending: boolean;
    pendingRequestType: string | null;
    avatar: string | null;
    isActive: boolean;
    createdAt: string;
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
    'VENDOR_REGISTRATION': 'Đăng ký Vendor',
};

export default function UserApprovalPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const response = await http.get('/users?vendorRequestPending=true');
            setUsers(response.data);
        } catch (error: any) {
            console.error("Lỗi khi lấy danh sách chờ duyệt:", error);
            toast.error("Không thể tải danh sách chờ duyệt");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApprove = async (userId: number) => {
        try {
            await http.patch(`/users/${userId}/approve-vendor`, { isApproved: true });
            toast.success("Đã phê duyệt quyền Vendor cho người dùng");
            fetchPendingUsers();
        } catch (error) {
            toast.error("Phê duyệt thất bại");
        }
    };

    const handleDecline = async (userId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn từ chối yêu cầu này?")) return;
        try {
            await http.patch(`/users/${userId}/approve-vendor`, { isApproved: false });
            toast.success("Đã từ chối yêu cầu Vendor");
            fetchPendingUsers();
        } catch (error) {
            toast.error("Thao tác thất bại");
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase tracking-tighter">Phê duyệt Tài khoản</h1>
                <p className="text-muted-foreground font-medium">
                    Danh sách người dùng đang chờ phê duyệt quyền Nhà cung cấp (Vendor).
                </p>
            </div>

            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="border-b bg-gray-50/30 px-10 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-widest text-gray-800">Yêu cầu đang chờ</CardTitle>
                            <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-1">Tổng cộng: {users.length} yêu cầu</CardDescription>
                        </div>
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                            <Input
                                type="search"
                                placeholder="Tìm tên, email..."
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
                                        <th className="px-10 py-6">Thành viên</th>
                                        <th className="px-10 py-6">Thông tin liên hệ</th>
                                        <th className="px-10 py-6">Yêu cầu</th>
                                        <th className="px-10 py-6">Ngày gửi yêu cầu</th>
                                        <th className="px-10 py-6 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-10 py-24 text-center">
                                                <p className="text-gray-400 font-bold italic">Không có yêu cầu nào đang chờ xử lý.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-blue-50/10 transition-all group">
                                                <td className="px-10 py-6 align-middle">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                                                            <AvatarImage src={user.avatar || ""} />
                                                            <AvatarFallback className="bg-blue-600 text-white font-black">
                                                                {user.username.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-gray-900">{user.username}</span>
                                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">ID: #{user.id}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 align-middle">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                            {user.email || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                                            <Phone className="h-3 w-3" />
                                                            {user.phonenumber || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-blue-600 text-white border-none font-bold uppercase text-[9px] px-3 py-1 rounded-full shadow-lg shadow-blue-100">
                                                            {user.pendingRequestType ? REQUEST_TYPE_LABELS[user.pendingRequestType] || user.pendingRequestType : 'Yêu cầu khác'}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 align-middle">
                                                    <Badge variant="outline" className="rounded-full border-gray-200 text-[10px] font-black text-gray-500">
                                                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                                    </Badge>
                                                </td>
                                                <td className="px-10 py-6 align-middle text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            onClick={() => { setSelectedUser(user); setIsViewOpen(true); }}
                                                            className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 transition-all"
                                                        >
                                                            <Eye className="h-5 w-5 text-gray-400" />
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleDecline(user.id)}
                                                            className="h-10 w-10 p-0 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-none transition-all active:scale-95"
                                                        >
                                                            <XCircle className="h-5 w-5" />
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleApprove(user.id)}
                                                            className="h-10 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 border-none transition-all active:scale-95 flex items-center gap-2 font-black text-xs uppercase tracking-tight shadow-lg shadow-emerald-100"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Duyệt ngay
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

            {/* Modal Xem chi tiết */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[480px] p-0 border-none shadow-3xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32 relative">
                         <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 p-1.5 bg-white rounded-full shadow-2xl">
                            <Avatar className="h-32 w-32 border-4 border-white">
                                <AvatarImage src={selectedUser?.avatar || ""} />
                                <AvatarFallback className="text-4xl font-black bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 uppercase">
                                    {selectedUser?.username.substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                         </div>
                    </div>
                    <div className="pt-20 pb-10 px-10 text-center">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{selectedUser?.username}</h3>
                        <div className="flex justify-center gap-2.5 mt-4">
                             <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 border-2 font-black uppercase text-[10px] rounded-full px-4 py-1">{selectedUser?.role}</Badge>
                             <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 border-2 font-black uppercase text-[10px] rounded-full px-4 py-1">
                                {selectedUser?.pendingRequestType ? REQUEST_TYPE_LABELS[selectedUser.pendingRequestType] || selectedUser.pendingRequestType : 'Đang chờ duyệt'}
                             </Badge>
                        </div>

                        <div className="mt-10 space-y-3 text-left">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                <p className="font-bold text-gray-900">{selectedUser?.email || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số điện thoại</p>
                                <p className="font-bold text-gray-900">{selectedUser?.phonenumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50/80 border-t flex justify-end gap-3">
                         <Button variant="ghost" onClick={() => setIsViewOpen(false)} className="rounded-xl font-bold">Đóng</Button>
                         <Button 
                            onClick={() => { handleApprove(selectedUser!.id); setIsViewOpen(false); }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl px-6"
                         >
                            Phê duyệt ngay
                         </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
