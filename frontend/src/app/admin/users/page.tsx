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
            password: "", // Để trống mặc định, chỉ nhập nếu muốn sửa
            role: user.role
        });
        setIsEditOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        setEditErrors({});

        // Frontend validation
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
            // Chuẩn bị dữ liệu gửi đi: Loại bỏ password nếu trống
            const payload: any = { ...editData };
            if (payload.password === "") {
                delete payload.password;
            }

            await http.patch(`/users/${selectedUser.id}`, payload);
            toast.success("Cập nhật thông tin thành công");
            setIsEditOpen(false);
            fetchUsers();
        } catch (error: any) {
            console.error("Lỗi cập nhật:", error);
            const message = error.response?.data?.message;
            if (error.response?.status === 400 && typeof message === 'string') {
                if (message.toLowerCase().includes('email')) setEditErrors({ email: "Email đã tồn tại" });
                else if (message.toLowerCase().includes('username')) setEditErrors({ username: "Tên đăng nhập đã tồn tại" });
            }
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
            console.error("Lỗi khi thêm người dùng:", error);
            const message = error.response?.data?.message;
            if (error.response?.status === 400 && typeof message === 'string') {
                if (message.toLowerCase().includes('email')) setErrors({ email: "Email đã tồn tại" });
                else if (message.toLowerCase().includes('username')) setErrors({ username: "Tên đăng nhập đã tồn tại" });
            }
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                    <p className="text-muted-foreground">Xem, thêm mới và quản lý quyền của người dùng trên hệ thống.</p>
                </div>
                <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
                    <UserPlus className="h-4 w-4" />
                    Thêm người dùng
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Danh sách người dùng</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Tìm tên, email..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <CardDescription>
                        Hiển thị tất cả người dùng trong hệ thống.
                    </CardDescription>
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
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Người dùng</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Vai trò</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Trạng thái</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Liên hệ</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                Không tìm thấy người dùng nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={user.avatar || ""} />
                                                            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-foreground">{user.username}</span>
                                                            <span className="text-xs text-muted-foreground">ID: {user.id}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        {user.role === 'ADMIN' ? (
                                                            <ShieldCheck className="h-4 w-4 text-red-500" />
                                                        ) : user.role === 'VENDOR' ? (
                                                            <ShieldAlert className="h-4 w-4 text-blue-500" />
                                                        ) : null}
                                                        <span>{user.role}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Badge variant={user.isActive ? (user.role === 'VENDOR' ? (user.isApprovedVendor ? "default" : "destructive") : "secondary") : "outline"}>
                                                        {!user.isActive ? 'Bị khóa' : (user.role === 'VENDOR'
                                                            ? (user.isApprovedVendor ? 'Đã duyệt' : 'Chờ duyệt')
                                                            : 'Hoạt động')}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            <Mail className="h-3 w-3" />
                                                            {user.email || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            <Phone className="h-3 w-3" />
                                                            {user.phonenumber || 'N/A'}
                                                        </div>
                                                    </div>
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
                                                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsViewOpen(true); }}>
                                                                <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openEditModal(user)}>
                                                                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                                                            </DropdownMenuItem>
                                                            {user.role === 'VENDOR' && (
                                                                <DropdownMenuItem
                                                                    className="text-blue-600 font-medium cursor-pointer"
                                                                    onClick={() => handleToggleVendorStatus(user.id, user.isApprovedVendor)}
                                                                >
                                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                                    {user.isApprovedVendor ? 'Hủy duyệt Vendor' : 'Phê duyệt Vendor'}
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className={user.isActive ? "text-destructive" : "text-green-600"}
                                                                onClick={() => handleLockAccount(user.id)}
                                                            >
                                                                {user.isActive ? (
                                                                    <><Lock className="mr-2 h-4 w-4" /> Khóa tài khoản</>
                                                                ) : (
                                                                    <><Unlock className="mr-2 h-4 w-4" /> Mở khóa tài khoản</>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive font-semibold"
                                                                onClick={() => handleDeleteUser(user.id)}
                                                            >
                                                                <UserX className="mr-2 h-4 w-4" /> Xóa tài khoản
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
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Chi tiết người dùng</DialogTitle>
                        <DialogDescription>
                            Thông tin đầy đủ của tài khoản trên hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col items-center gap-4 mb-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={selectedUser.avatar || ""} />
                                    <AvatarFallback className="text-2xl">{selectedUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold">{selectedUser.username}</h3>
                                    <Badge variant="secondary" className="mt-1">{selectedUser.role}</Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4 border-b pb-2">
                                <Label className="text-right font-semibold">Email</Label>
                                <div className="col-span-3 text-sm">{selectedUser.email || 'Chưa cập nhật'}</div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4 border-b pb-2">
                                <Label className="text-right font-semibold">SĐT</Label>
                                <div className="col-span-3 text-sm">{selectedUser.phonenumber || 'Chưa cập nhật'}</div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4 border-b pb-2">
                                <Label className="text-right font-semibold">Ngày tạo</Label>
                                <div className="col-span-3 text-sm">{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right font-semibold">Trạng thái</Label>
                                <div className="col-span-3">
                                    <Badge variant={selectedUser.isActive ? "default" : "destructive"}>
                                        {selectedUser.isActive ? "Đang hoạt động" : "Đã khóa"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal Chỉnh sửa */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin cơ bản của người dùng.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Tên người dùng <span className="text-destructive">*</span></Label>
                            <Input
                                id="username"
                                value={editData.username}
                                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                className={editErrors.username ? "border-destructive" : ""}
                            />
                            {editErrors.username && <p className="text-xs text-destructive">{editErrors.username}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Số điện thoại <span className="text-destructive">*</span></Label>
                            <Input
                                id="phone"
                                value={editData.phonenumber}
                                onChange={(e) => setEditData({ ...editData, phonenumber: e.target.value })}
                                className={editErrors.phonenumber ? "border-destructive" : ""}
                            />
                            {editErrors.phonenumber && <p className="text-xs text-destructive">{editErrors.phonenumber}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                            <Input
                                id="email"
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                className={editErrors.email ? "border-destructive" : ""}
                            />
                            {editErrors.email && <p className="text-xs text-destructive">{editErrors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pass">Mật khẩu mới</Label>
                            <Input
                                id="pass"
                                type="password"
                                placeholder="Để trống nếu không thay đổi"
                                value={editData.password}
                                onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                            />
                            <p className="text-[10px] text-muted-foreground italic">Chỉ điền nếu muốn đổi mật khẩu</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Vai trò</Label>
                            <Select
                                value={editData.role}
                                onValueChange={(value) => setEditData({ ...editData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                                    <SelectItem value="VENDOR">VENDOR</SelectItem>
                                    <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
                        <Button onClick={handleUpdateUser}>Lưu thay đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Thêm người dùng */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Thêm người dùng mới</DialogTitle>
                        <DialogDescription>
                            Tạo tài khoản mới cho người dùng trên hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="add-username">Tên đăng nhập <span className="text-destructive">*</span></Label>
                            <Input
                                id="add-username"
                                placeholder="Ví dụ: giahuy123"
                                value={addData.username}
                                onChange={(e) => setAddData({ ...addData, username: e.target.value })}
                                className={errors.username ? "border-destructive" : ""}
                            />
                            {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="add-email">Email <span className="text-destructive">*</span></Label>
                            <Input
                                id="add-email"
                                type="email"
                                placeholder="email@example.com"
                                value={addData.email}
                                onChange={(e) => setAddData({ ...addData, email: e.target.value })}
                                className={errors.email ? "border-destructive" : ""}
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="add-phone">Số điện thoại <span className="text-destructive">*</span></Label>
                            <Input
                                id="add-phone"
                                placeholder="0123456789"
                                value={addData.phonenumber}
                                onChange={(e) => setAddData({ ...addData, phonenumber: e.target.value })}
                                className={errors.phonenumber ? "border-destructive" : ""}
                            />
                            {errors.phonenumber && <p className="text-xs text-destructive">{errors.phonenumber}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="add-pass">Mật khẩu <span className="text-destructive">*</span></Label>
                            <Input
                                id="add-pass"
                                type="password"
                                placeholder="Tối thiểu 6 ký tự"
                                value={addData.password}
                                onChange={(e) => setAddData({ ...addData, password: e.target.value })}
                                className={errors.password ? "border-destructive" : ""}
                            />
                            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="add-role">Vai trò</Label>
                            <Select
                                value={addData.role}
                                onValueChange={(value) => setAddData({ ...addData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                                    <SelectItem value="VENDOR">VENDOR</SelectItem>
                                    <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
                        <Button onClick={handleCreateUser}>Thêm mới</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
