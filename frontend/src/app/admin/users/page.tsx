"use client";

import React, { useEffect, useState } from 'react';
import {
    Search,
    UserPlus,
    MoreHorizontal,
    ShieldCheck,
    ShieldAlert,
    Mail,
    Phone,
    Loader2,
    Eye,
    Edit,
    Lock,
    Unlock,
    UserX
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import http from '@/lib/http';
import { toast } from 'react-hot-toast';

interface User {
    id: number;
    username: string;
    email: string | null;
    phonenumber: string | null;
    role: string;
    isApprovedVendor: boolean;
    avatar: string | null;
    isActive: boolean;
    createdAt: string;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    
    const [editData, setEditData] = useState({
        username: "",
        phonenumber: "",
        email: "",
        password: "",
        role: ""
    });
    const [addData, setAddData] = useState({
        username: "",
        phonenumber: "",
        email: "",
        password: "",
        role: "CUSTOMER"
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await http.get('/users');
            setUsers(response.data);
        } catch (error: any) {
            console.error("Lỗi khi lấy danh sách người dùng:", error);
            toast.error("Không thể tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleVendorStatus = async (userId: number, currentStatus: boolean) => {
        try {
            await http.patch(`/users/${userId}/status`, { isApprovedVendor: !currentStatus });
            toast.success("Cập nhật trạng thái thành công");
            fetchUsers();
        } catch (error) {
            toast.error("Cập nhật trạng thái thất bại");
        }
    };

    const handleLockAccount = async (userId: number) => {
        try {
            await http.patch(`/users/${userId}/toggle-active`);
            toast.success("Đã thay đổi trạng thái tài khoản");
            fetchUsers();
        } catch (error) {
            toast.error("Thao tác thất bại");
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setEditData({
            username: user.username,
            phonenumber: user.phonenumber || "",
            email: user.email || "",
            password: "",
            role: user.role
        });
        setIsEditOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        setEditErrors({});
        const newErrors: Record<string, string> = {};
        if (!editData.username) newErrors.username = "Tên không được để trống";
        if (!editData.email) newErrors.email = "Email không được để trống";
        else if (!/\S+@\S+\.\S+/.test(editData.email)) newErrors.email = "Email không hợp lệ";
        if (!editData.phonenumber) newErrors.phonenumber = "Số điện thoại không được để trống";

        if (Object.keys(newErrors).length > 0) {
            setEditErrors(newErrors);
            return;
        }

        try {
            const payload: any = { ...editData };
            if (payload.password === "") delete payload.password;
            await http.patch(`/users/${selectedUser.id}`, payload);
            toast.success("Cập nhật thông tin thành công");
            setIsEditOpen(false);
            fetchUsers();
        } catch (error: any) {
            const message = error.response?.data?.message;
            toast.error(Array.isArray(message) ? message[0] : (message || "Cập nhật thất bại"));
        }
    };

    const handleCreateUser = async () => {
        setErrors({});
        const newErrors: Record<string, string> = {};
        if (!addData.username) newErrors.username = "Tên đăng nhập không được để trống";
        if (!addData.email) newErrors.email = "Email không được để trống";
        else if (!/\S+@\S+\.\S+/.test(addData.email)) newErrors.email = "Email không hợp lệ";
        if (!addData.phonenumber) newErrors.phonenumber = "Số điện thoại không được để trống";
        if (!addData.password) newErrors.password = "Mật khẩu không được để trống";
        else if (addData.password.length < 6) newErrors.password = "Mật khẩu phải từ 6 ký tự";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await http.post('/users', addData);
            toast.success("Thêm người dùng thành công");
            setIsAddOpen(false);
            setAddData({
                username: "",
                phonenumber: "",
                email: "",
                password: "",
                role: "CUSTOMER"
            });
            fetchUsers();
        } catch (error: any) {
            const message = error.response?.data?.message;
            toast.error(Array.isArray(message) ? message[0] : (message || "Thêm người dùng thất bại"));
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.")) return;
        try {
            await http.delete(`/users/${userId}`);
            toast.success("Đã xóa tài khoản thành công");
            fetchUsers();
        } catch (error) {
            toast.error("Xóa tài khoản thất bại");
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="container mx-auto py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý người dùng</h1>
                <p className="text-muted-foreground transition-all duration-300">
                    Xem, thêm mới và quản lý quyền của người dùng trên hệ thống.
                </p>
            </div>

            <div className="flex justify-end mb-6">
                 <Button onClick={() => setIsAddOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 rounded-xl px-6 transition-all active:scale-95">
                    <UserPlus className="h-4 w-4" />
                    Thêm người dùng mới
                </Button>
            </div>

            <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden rounded-3xl">
                <CardHeader className="border-b bg-gray-50/50 px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Danh sách thành viên</CardTitle>
                            <CardDescription className="font-medium text-gray-500">Quản lý toàn bộ tài khoản người dùng trong hệ thống.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                            <Input
                                type="search"
                                placeholder="Tìm kiếm nhanh..."
                                className="pl-11 h-12 rounded-2xl bg-white focus:ring-4 focus:ring-blue-100 border-gray-200 font-bold transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex h-80 items-center justify-center">
                            <div className="relative">
                                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                                <div className="absolute inset-0 blur-xl bg-blue-400/20 animate-pulse rounded-full"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-gray-100/80 text-gray-500 text-[10px] uppercase font-black tracking-widest border-b">
                                    <tr>
                                        <th className="px-8 py-5">Thành viên</th>
                                        <th className="px-8 py-5">Vai trò hệ thống</th>
                                        <th className="px-8 py-5">Trạng thái</th>
                                        <th className="px-8 py-5">Thông tin liên hệ</th>
                                        <th className="px-8 py-5 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-gray-50 rounded-full">
                                                        <Search className="h-8 w-8 text-gray-300" />
                                                    </div>
                                                    <p className="text-gray-400 font-bold italic">Không tìm thấy kết quả phù hợp.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-blue-50/10 transition-all group">
                                                <td className="px-8 py-5 align-middle">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <Avatar className="h-12 w-12 border-2 border-white shadow-md ring-2 ring-gray-100 transition-transform group-hover:scale-110">
                                                                <AvatarImage src={user.avatar || ""} />
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white font-black text-xs">
                                                                    {user.username.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {user.isActive && <div className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-gray-900 text-base leading-tight tracking-tight">{user.username}</span>
                                                            <span className="text-[10px] text-gray-400 font-black uppercase flex items-center gap-1 mt-0.5">
                                                                <span className="text-blue-500">ID:</span> #{user.id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        {user.role === 'ADMIN' ? (
                                                            <Badge className="bg-red-50 text-red-600 border-red-100 border-2 hover:bg-red-100 transition-colors flex items-center gap-1.5 font-black rounded-xl px-3 py-1 text-[10px]">
                                                                <ShieldCheck className="h-3 w-3" />
                                                                ADMIN
                                                            </Badge>
                                                        ) : user.role === 'VENDOR' ? (
                                                            <Badge className="bg-blue-50 text-blue-700 border-blue-100 border-2 hover:bg-blue-100 transition-colors flex items-center gap-1.5 font-black rounded-xl px-3 py-1 text-[10px]">
                                                                <ShieldAlert className="h-3 w-3" />
                                                                VENDOR
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-gray-50 text-gray-600 border-gray-100 border-2 hover:bg-gray-100 transition-colors font-black rounded-xl px-3 py-1 text-[10px]">
                                                                CUSTOMER
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 align-middle">
                                                    <Badge 
                                                        variant="outline"
                                                        className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-tight shadow-sm border-2 ${
                                                            !user.isActive 
                                                                ? 'bg-gray-50 text-gray-400 border-gray-200' 
                                                                : (user.role === 'VENDOR' && !user.isApprovedVendor 
                                                                    ? 'bg-orange-50 text-orange-600 border-orange-200' 
                                                                    : 'bg-green-50 text-green-700 border-green-200')
                                                        }`}
                                                    >
                                                        {!user.isActive ? 'Đã khóa' : (user.role === 'VENDOR'
                                                            ? (user.isApprovedVendor ? 'Đã duyệt' : 'Chờ duyệt')
                                                            : 'Hoạt động')}
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-5 align-middle">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2 group/contact">
                                                            <div className="p-1.5 bg-gray-50 rounded-lg group-hover/contact:bg-blue-50 transition-colors">
                                                                <Mail className="h-3 w-3 text-gray-400 group-hover/contact:text-blue-600" />
                                                            </div>
                                                            <span className="text-xs font-black text-gray-700 truncate max-w-[150px]">{user.email || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 group/contact">
                                                            <div className="p-1.5 bg-gray-50 rounded-lg group-hover/contact:bg-blue-50 transition-colors">
                                                                <Phone className="h-3 w-3 text-gray-400 group-hover/contact:text-blue-600" />
                                                            </div>
                                                            <span className="text-[11px] font-bold text-gray-400 tracking-tight">{user.phonenumber || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 align-middle text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-2xl hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-100 transition-all active:scale-90">
                                                                <MoreHorizontal className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 min-w-[200px] animate-in slide-in-from-top-1 duration-200">
                                                            <DropdownMenuLabel className="text-[10px] uppercase font-black text-gray-400 px-4 py-3 tracking-widest">Trung tâm điều khiển</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsViewOpen(true); }} className="gap-3 rounded-xl focus:bg-blue-50 focus:text-blue-600 cursor-pointer font-bold px-4 py-3">
                                                                <Eye className="h-4 w-4" /> Xem hồ sơ chi tiết
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openEditModal(user)} className="gap-3 rounded-xl focus:bg-blue-50 focus:text-blue-600 cursor-pointer font-bold px-4 py-3">
                                                                <Edit className="h-4 w-4" /> Chỉnh sửa thông tin
                                                            </DropdownMenuItem>
                                                            
                                                            {user.role === 'VENDOR' && (
                                                                <DropdownMenuItem
                                                                    className="rounded-xl focus:bg-blue-600 focus:text-white cursor-pointer font-bold text-blue-700 px-4 py-3"
                                                                    onClick={() => handleToggleVendorStatus(user.id, user.isApprovedVendor)}
                                                                >
                                                                    <ShieldCheck className="h-4 w-4" />
                                                                    {user.isApprovedVendor ? 'Hủy quyền Vendor' : 'Cấp quyền Vendor'}
                                                                </DropdownMenuItem>
                                                            )}
                                                            
                                                            <DropdownMenuSeparator className="my-2 bg-gray-50" />
                                                            
                                                            <DropdownMenuItem
                                                                className={`rounded-xl font-bold cursor-pointer px-4 py-3 transition-colors ${user.isActive ? "text-orange-600 focus:bg-orange-50 focus:text-orange-600" : "text-green-600 focus:bg-green-50 focus:text-green-600"}`}
                                                                onClick={() => handleLockAccount(user.id)}
                                                            >
                                                                {user.isActive ? (
                                                                    <><Lock className="h-4 w-4" /> Khóa tài khoản ngay</>
                                                                ) : (
                                                                    <><Unlock className="h-4 w-4" /> Mở khóa tài khoản</>
                                                                )}
                                                            </DropdownMenuItem>
                                                            
                                                            <DropdownMenuSeparator className="my-2 bg-gray-50" />
                                                            
                                                            <DropdownMenuItem
                                                                className="text-red-600 rounded-xl focus:bg-red-600 focus:text-white cursor-pointer font-black uppercase text-[10px] tracking-widest px-4 py-3"
                                                                onClick={() => handleDeleteUser(user.id)}
                                                            >
                                                                <UserX className="h-4 w-4" /> Xóa vĩnh viễn
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
                             <Badge className={`font-black uppercase text-[10px] rounded-full px-4 py-1 border-2 shadow-sm ${selectedUser?.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                                {selectedUser?.isActive ? "Đang hoạt động" : "Tạm khóa"}
                             </Badge>
                        </div>

                        <div className="mt-10 space-y-3">
                            {[
                                { label: "Địa chỉ Email", value: selectedUser?.email || 'Chưa cập nhật', icon: Mail },
                                { label: "Số điện thoại", value: selectedUser?.phonenumber || 'Chưa cập nhật', icon: Phone },
                                { label: "Ngày gia nhập", value: selectedUser && new Date(selectedUser.createdAt).toLocaleDateString('vi-VN'), icon: ShieldCheck },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/80 transition-hover hover:border-blue-200 hover:bg-white shadow-sm duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <item.icon className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-800">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50/80 border-t flex justify-center gap-4">
                         <Button onClick={() => setIsViewOpen(false)} className="rounded-2xl px-12 h-12 font-black bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200 shadow-xl transition-all active:scale-95 text-xs uppercase tracking-widest">Đóng</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal Chỉnh sửa */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 border-none shadow-3xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-7">
                         <DialogTitle className="text-white text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Edit className="w-6 h-6" />
                            </div>
                            Hiệu chỉnh thông tin
                         </DialogTitle>
                    </div>
                    <div className="px-10 py-8 space-y-6">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black uppercase text-gray-500 tracking-wider ml-1">Tên hiển thị</Label>
                                <Input
                                    value={editData.username}
                                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                    className={`h-12 rounded-2xl border-2 transition-all font-bold ${editErrors.username ? "border-red-500 bg-red-50 shadow-red-50" : "focus:border-blue-500 focus:ring-4 focus:ring-blue-100"}`}
                                />
                                {editErrors.username && <p className="text-[10px] text-red-500 font-bold ml-1">{editErrors.username}</p>}
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black uppercase text-gray-500 tracking-wider ml-1">Số điện thoại</Label>
                                <Input
                                    value={editData.phonenumber}
                                    onChange={(e) => setEditData({ ...editData, phonenumber: e.target.value })}
                                    className={`h-12 rounded-2xl border-2 transition-all font-bold ${editErrors.phonenumber ? "border-red-500 bg-red-50 shadow-red-50" : "focus:border-blue-500 focus:ring-4 focus:ring-blue-100"}`}
                                />
                                {editErrors.phonenumber && <p className="text-[10px] text-red-500 font-bold ml-1">{editErrors.phonenumber}</p>}
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-black uppercase text-gray-500 tracking-wider ml-1">Email liên lạc</Label>
                            <Input
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                className={`h-12 rounded-2xl border-2 transition-all font-bold ${editErrors.email ? "border-red-500 bg-red-50 shadow-red-50" : "focus:border-blue-500 focus:ring-4 focus:ring-blue-100"}`}
                            />
                            {editErrors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{editErrors.email}</p>}
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-black uppercase text-gray-500 tracking-wider ml-1">Mật khẩu mới (Nếu có)</Label>
                            <Input
                                type="password"
                                placeholder="..."
                                value={editData.password}
                                onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                                className="h-12 rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-bold"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-black uppercase text-gray-500 tracking-wider ml-1">Cấp bậc truy cập</Label>
                            <Select
                                value={editData.role}
                                onValueChange={(value) => setEditData({ ...editData, role: value })}
                            >
                                <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-100 font-black shadow-sm transition-all focus:ring-4 focus:ring-blue-100">
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent className="z-[100] rounded-2xl border-none shadow-2xl p-2">
                                    <SelectItem value="ADMIN" className="font-black rounded-xl focus:bg-red-50 focus:text-red-600 px-4 py-3">PHỤ TRÁCH HỆ THỐNG (ADMIN)</SelectItem>
                                    <SelectItem value="VENDOR" className="font-black rounded-xl focus:bg-blue-50 focus:text-blue-600 px-4 py-3">NHÀ CUNG CẤP (VENDOR)</SelectItem>
                                    <SelectItem value="CUSTOMER" className="font-black rounded-xl focus:bg-gray-50 px-4 py-3">NGƯỜI MUA (CUSTOMER)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="px-10 py-7 bg-gray-50/80 border-t flex justify-end gap-3 relative z-[-1]">
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-2xl h-12 px-8 font-bold text-gray-500 hover:bg-white transition-all">Quay lại</Button>
                        <Button onClick={handleUpdateUser} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 h-12 rounded-2xl shadow-xl shadow-blue-200 uppercase tracking-tighter transition-all active:scale-95 z-0">Lưu thông tin</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal Thêm người dùng */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 border-none shadow-3xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-700 px-10 py-7">
                         <DialogTitle className="text-white text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            Thêm thành viên mới
                         </DialogTitle>
                    </div>
                    <div className="px-10 py-8 space-y-6">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black uppercase text-gray-500 tracking-wider ml-1">Tên đăng nhập</Label>
                                <Input
                                    placeholder="giahuy123..."
                                    value={addData.username}
                                    onChange={(e) => setAddData({ ...addData, username: e.target.value })}
                                    className={`h-12 rounded-2xl border-2 transition-all font-bold ${errors.username ? "border-red-500 bg-red-50 shadow-red-50" : "focus:border-orange-500 focus:ring-4 focus:ring-orange-100"}`}
                                />
                                {errors.username && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.username}</p>}
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black uppercase text-gray-500 tracking-wider ml-1">Số điện thoại</Label>
                                <Input
                                    placeholder="0123xxx..."
                                    value={addData.phonenumber}
                                    onChange={(e) => setAddData({ ...addData, phonenumber: e.target.value })}
                                    className={`h-12 rounded-2xl border-2 transition-all font-bold ${errors.phonenumber ? "border-red-500 bg-red-50 shadow-red-50" : "focus:border-orange-500 focus:ring-4 focus:ring-orange-100"}`}
                                />
                                {errors.phonenumber && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phonenumber}</p>}
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-black uppercase text-gray-500 tracking-wider ml-1">Địa chỉ Email</Label>
                            <Input
                                type="email"
                                placeholder="name@domain.com..."
                                value={addData.email}
                                onChange={(e) => setAddData({ ...addData, email: e.target.value })}
                                className={`h-12 rounded-2xl border-2 transition-all font-bold ${errors.email ? "border-red-500 bg-red-50 shadow-red-50" : "focus:border-orange-500 focus:ring-4 focus:ring-orange-100"}`}
                            />
                            {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-black uppercase text-gray-500 tracking-wider ml-1">Mật khẩu truy cập</Label>
                            <Input
                                type="password"
                                placeholder="..."
                                value={addData.password}
                                onChange={(e) => setAddData({ ...addData, password: e.target.value })}
                                className={`h-12 rounded-2xl border-2 transition-all font-bold ${errors.password ? "border-red-500 bg-red-50 shadow-red-50" : "focus:border-orange-500 focus:ring-4 focus:ring-orange-100"}`}
                            />
                            {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password}</p>}
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-black uppercase text-gray-500 tracking-wider ml-1">Vị trí đảm nhiệm</Label>
                            <Select
                                value={addData.role}
                                onValueChange={(value) => setAddData({ ...addData, role: value })}
                            >
                                <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-100 font-black shadow-sm transition-all focus:ring-4 focus:ring-orange-100">
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent className="z-[100] rounded-2xl border-none shadow-2xl p-2">
                                    <SelectItem value="ADMIN" className="font-black rounded-xl focus:bg-red-50 focus:text-red-600 px-4 py-3">PHỤ TRÁCH HỆ THỐNG (ADMIN)</SelectItem>
                                    <SelectItem value="VENDOR" className="font-black rounded-xl focus:bg-blue-50 focus:text-blue-600 px-4 py-3">NHÀ CUNG CẤP (VENDOR)</SelectItem>
                                    <SelectItem value="CUSTOMER" className="font-black rounded-xl focus:bg-gray-50 px-4 py-3">NGƯỜI MUA (CUSTOMER)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="px-10 py-7 bg-gray-50/80 border-t flex justify-end gap-3 relative z-[-1]">
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-2xl h-12 px-8 font-bold text-gray-500 hover:bg-white transition-all">Đóng cửa sổ</Button>
                        <Button onClick={handleCreateUser} className="bg-orange-600 hover:bg-orange-700 text-white font-black px-12 h-12 rounded-2xl shadow-xl shadow-orange-200 uppercase tracking-tighter transition-all active:scale-95 z-0">Tạo tài khoản</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
