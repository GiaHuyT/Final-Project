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
    UserX,
    EyeOff
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
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
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
import { cn } from '@/lib/utils';

interface User {
    id: number;
    username: string;
    email: string | null;
    phonenumber: string | null;
    roles: string[];
    isApprovedVendor: boolean;
    vendorRequestPending: boolean;
    avatar: string | null;
    isActive: boolean;
    lockedRoles?: string[];
    lockUntil?: string;
    lockReason?: string;
    roleLockReasons?: Record<string, string>;
    createdAt: string;
}

export function UsersTab({ onSubViewChange }: { onSubViewChange?: (isOpen: boolean) => void }) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("ALL");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [showAddPassword, setShowAddPassword] = useState(false);
    
    // States cho khóa tài khoản
    const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
    const [userToLock, setUserToLock] = useState<number | null>(null);
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [customReason, setCustomReason] = useState("");
    const [isCustomReason, setIsCustomReason] = useState(false);
    const [lockType, setLockType] = useState<'FULL' | 'PARTIAL'>('FULL');
    const [rolesToLock, setRolesToLock] = useState<string[]>([]);
    const [roleReasonsState, setRoleReasonsState] = useState<Record<string, { selected: string[], custom: string, isCustom: boolean }>>({});
    const [lockDurationDays, setLockDurationDays] = useState<number>(0);
    const [userToLockData, setUserToLockData] = useState<User | null>(null);

    // States cho MỞ khóa tài khoản
    const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
    const [userToUnlock, setUserToUnlock] = useState<User | null>(null);
    
    const PREDEFINED_REASONS = [
        "Vi phạm quy định nền tảng",
        "Spam tin nhắn/đơn hàng",
        "Tài khoản có dấu hiệu giả mạo",
        "Hành vi lừa đảo/gian lận"
    ];

    const ROLE_REASONS: Record<string, string[]> = {
        'VENDOR': [
            "Đăng thông tin xe sai sự thật",
            "Hủy giao dịch/đơn đặt cọc nhiều lần",
            "Bàn giao xe chậm trễ thường xuyên",
            "Bán xe kém chất lượng, xe lỗi",
        ],
        'DRIVER': [
            "Hủy cuốc xe nhiều lần",
            "Thái độ phục vụ khách kém",
            "Vi phạm an toàn giao thông",
            "Thu thêm phụ phí sai quy định",
        ],
        'CUSTOMER': [
            "Hủy lịch hẹn/cọc xe nhiều lần",
            "Đánh giá/Review sai sự thật",
            "Spam đặt lịch/hủy lịch",
        ]
    };

    useEffect(() => {
        if (onSubViewChange) {
            onSubViewChange(isViewOpen || isEditOpen || isAddOpen);
        }
    }, [isViewOpen, isEditOpen, isAddOpen, onSubViewChange]);
    
    const [editData, setEditData] = useState({
        username: "",
        phonenumber: "",
        email: "",
        password: "",
        roles: [] as string[]
    });
    const [addData, setAddData] = useState({
        username: "",
        phonenumber: "",
        email: "",
        password: "",
        roles: ["CUSTOMER"]
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
            await http.patch(`/users/${userId}/approve-vendor`, { isApproved: !currentStatus });
            toast.success("Cập nhật trạng thái thành công");
            fetchUsers();
        } catch (error) {
            toast.error("Cập nhật trạng thái thất bại");
        }
    };

    const handleLockAccount = (user: User) => {
        const isPartiallyLocked = user.lockedRoles && user.lockedRoles.length > 0;
        
        if (!user.isActive || isPartiallyLocked) {
            setUserToUnlock(user);
            setIsUnlockDialogOpen(true);
        } else {
            setUserToLock(user.id);
            setUserToLockData(user);
            setLockType('FULL');
            setRolesToLock([]);
            setRoleReasonsState({});
            setLockDurationDays(0);
            setSelectedReasons([]);
            setCustomReason("");
            setIsCustomReason(false);
            setIsLockDialogOpen(true);
        }
    };

    const confirmUnlockAccount = () => {
        if (!userToUnlock) return;
        http.patch(`/users/${userToUnlock.id}/toggle-active`, { lockType: 'FULL' })
            .then(() => {
                toast.success("Đã mở khóa tài khoản thành công");
                setIsUnlockDialogOpen(false);
                setUserToUnlock(null);
                fetchUsers();
            })
            .catch(() => toast.error("Thao tác thất bại"));
    };

    const handleUnlockSingleRole = (roleToUnlock: string) => {
        if (!userToUnlock || !userToUnlock.lockedRoles) return;

        const newLockedRoles = userToUnlock.lockedRoles.filter(r => r !== roleToUnlock);
        const newRoleReasons = { ...userToUnlock.roleLockReasons };
        delete newRoleReasons[roleToUnlock];

        http.patch(`/users/${userToUnlock.id}/toggle-active`, { 
            lockType: 'PARTIAL',
            lockedRoles: newLockedRoles,
            roleReasons: newRoleReasons
        })
        .then(() => {
            toast.success(`Đã gỡ khóa vai trò ${roleToUnlock}`);
            
            if (newLockedRoles.length === 0) {
                setIsUnlockDialogOpen(false);
                setUserToUnlock(null);
            } else {
                setUserToUnlock({ 
                    ...userToUnlock, 
                    lockedRoles: newLockedRoles,
                    roleLockReasons: newRoleReasons
                });
            }
            fetchUsers();
        })
        .catch(() => toast.error("Thao tác thất bại"));
    };

    const confirmLockAccount = async () => {
        if (!userToLock) return;
        
        let finalReason = "";
        let finalRoleReasons: Record<string, string> = {};

        if (lockType === 'FULL') {
            finalReason = selectedReasons.join(", ");
            if (isCustomReason && customReason.trim()) {
                finalReason = finalReason ? `${finalReason}, ${customReason.trim()}` : customReason.trim();
            }
            if (!finalReason.trim()) {
                toast.error("Vui lòng chọn hoặc nhập lý do khóa tài khoản");
                return;
            }
        } else {
            if (rolesToLock.length === 0) {
                if (!window.confirm("Bạn đang mở khóa cho tất cả các vai trò (Xóa trạng thái khóa một phần)?")) return;
            } else {
                for (const role of rolesToLock) {
                    const state = roleReasonsState[role];
                    let rReason = state?.selected.join(", ") || "";
                    if (state?.isCustom && state?.custom.trim()) {
                        rReason = rReason ? `${rReason}, ${state.custom.trim()}` : state.custom.trim();
                    }
                    if (!rReason.trim()) {
                        toast.error(`Vui lòng chọn/nhập lý do khóa cho vai trò ${role}`);
                        return;
                    }
                    finalRoleReasons[role] = rReason;
                }
            }
        }

        try {
            await http.patch(`/users/${userToLock}/toggle-active`, { 
                reason: finalReason,
                lockType,
                lockedRoles: rolesToLock,
                lockDurationDays,
                roleReasons: finalRoleReasons
            });
            toast.success("Thao tác thành công");
            setIsLockDialogOpen(false);
            setUserToLock(null);
            setUserToLockData(null);
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
            roles: user.roles
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
                roles: ["CUSTOMER"]
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

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesRole = roleFilter === "ALL" || (user.roles && user.roles.includes(roleFilter));
        
        return matchesSearch && matchesRole;
    });

    if (isViewOpen && selectedUser) {
        return (
            <div className="space-y-6 flex-1 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 mb-2">
                    <Button variant="outline" onClick={() => setIsViewOpen(false)} className="rounded-xl font-bold border-2">
                        Quay lại danh sách
                    </Button>
                </div>
                <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden rounded-3xl">
                    <div className="bg-gradient-to-r from-gray-900 to-black h-40 relative">
                         <div className="absolute -bottom-16 left-12 p-1.5 bg-white rounded-full shadow-2xl">
                            <Avatar className="h-32 w-32 border-4 border-white">
                                <AvatarImage src={selectedUser.avatar || ""} />
                                <AvatarFallback className="text-4xl font-black bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900 uppercase">
                                    {selectedUser.username.substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                         </div>
                    </div>
                    <div className="pt-24 pb-10 px-12">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{selectedUser.username}</h3>
                        <div className="flex gap-2.5 mt-4">
                             <Badge variant="secondary" className="bg-gray-100 text-gray-900 border-gray-200 border-2 font-black uppercase text-[10px] rounded-full px-4 py-1">{selectedUser?.roles?.join(', ')}</Badge>
                             <Badge className={`font-black uppercase text-[10px] rounded-full px-4 py-1 border-2 shadow-sm ${!selectedUser.isActive ? "bg-red-50 text-red-600 border-red-200" : (selectedUser.lockedRoles && selectedUser.lockedRoles.length > 0) ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-green-50 text-green-700 border-green-200"}`}>
                                {!selectedUser.isActive ? "Tạm khóa (Toàn bộ)" : (selectedUser.lockedRoles && selectedUser.lockedRoles.length > 0) ? `Khóa: ${selectedUser.lockedRoles.join(', ')}` : "Đang hoạt động"}
                             </Badge>
                             {selectedUser.lockUntil && (
                                <Badge className="bg-gray-100 text-gray-700 border-gray-200 border-2 font-bold text-[10px] rounded-full px-4 py-1">
                                    Đến {new Date(selectedUser.lockUntil).toLocaleDateString('vi-VN')}
                                </Badge>
                             )}
                        </div>

                        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: "Địa chỉ Email", value: selectedUser.email || 'Chưa cập nhật', icon: Mail },
                                { label: "Số điện thoại", value: selectedUser.phonenumber || 'Chưa cập nhật', icon: Phone },
                                { label: "Ngày gia nhập", value: new Date(selectedUser.createdAt).toLocaleDateString('vi-VN'), icon: ShieldCheck },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100/80 transition-hover hover:border-gray-300 hover:bg-white shadow-sm duration-300">
                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                        <item.icon className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{item.label}</div>
                                        <div className="text-sm font-black text-gray-800 mt-1">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (isEditOpen && selectedUser) {
        return (
            <div className="space-y-6 flex-1 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 mb-2">
                    <Button variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl font-bold border-2">
                        Quay lại danh sách
                    </Button>
                </div>
                <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden rounded-3xl">
                    <div className="bg-gradient-to-r from-gray-900 to-black px-10 py-7">
                         <div className="text-white text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Edit className="w-6 h-6" />
                            </div>
                            Hiệu chỉnh thông tin
                         </div>
                    </div>
                    <CardContent className="p-10 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">Tên hiển thị</Label>
                                <Input
                                    value={editData.username}
                                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                    className={`h-14 rounded-2xl border-2 transition-all font-bold ${editErrors.username ? "border-red-500 bg-red-50 shadow-red-50" : "focus:border-gray-900 focus:ring-4 focus:ring-gray-200"}`}
                                />
                                {editErrors.username && <p className="text-[10px] text-red-500 font-bold ml-1">{editErrors.username}</p>}
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">Số điện thoại</Label>
                                <Input
                                    value={editData.phonenumber}
                                    onChange={(e) => setEditData({ ...editData, phonenumber: e.target.value })}
                                    className={`h-14 rounded-2xl border-2 transition-all font-bold ${editErrors.phonenumber ? "border-red-500 bg-red-50 shadow-red-50" : "focus:border-gray-900 focus:ring-4 focus:ring-gray-200"}`}
                                />
                                {editErrors.phonenumber && <p className="text-[10px] text-red-500 font-bold ml-1">{editErrors.phonenumber}</p>}
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">Email liên lạc</Label>
                            <Input
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                className={`h-14 rounded-2xl border-2 transition-all font-bold ${editErrors.email ? "border-red-500 bg-red-50 shadow-red-50" : "focus:border-gray-900 focus:ring-4 focus:ring-gray-200"}`}
                            />
                            {editErrors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{editErrors.email}</p>}
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">Mật khẩu mới (Nếu có)</Label>
                            <div className="relative flex items-center">
                                <Input
                                    type={showEditPassword ? "text" : "password"}
                                    placeholder="..."
                                    value={editData.password}
                                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                                    className="h-14 rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:ring-4 focus:ring-gray-200 font-bold pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => { setShowEditPassword(!showEditPassword); }}
                                    className="absolute right-4 text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    {showEditPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">Cấp bậc truy cập</Label>
                            <div className="flex flex-col gap-2 p-4 border-2 border-gray-100 rounded-2xl">
                                {['ADMIN', 'VENDOR', 'CUSTOMER', 'DRIVER'].map((roleItem) => (
                                    <Label key={roleItem} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                            checked={editData.roles.includes(roleItem)}
                                            onChange={(e) => {
                                                let newRoles = e.target.checked ? [...editData.roles, roleItem] : editData.roles.filter(r => r !== roleItem);
                                                if (roleItem === 'ADMIN' && e.target.checked) newRoles = ['ADMIN'];
                                                else if (roleItem !== 'ADMIN' && e.target.checked) newRoles = newRoles.filter(r => r !== 'ADMIN');
                                                setEditData({ ...editData, roles: newRoles });
                                            }}
                                        />
                                        <span className="font-bold text-sm text-gray-700">
                                            {roleItem === 'ADMIN' ? 'Phụ trách hệ thống (ADMIN)' :
                                             roleItem === 'VENDOR' ? 'Nhà cung cấp (VENDOR)' :
                                             roleItem === 'DRIVER' ? 'Tài xế (DRIVER)' :
                                             'Người dùng (CUSTOMER)'}
                                        </span>
                                    </Label>
                                ))}
                            </div>
                        </div>
                        <div className="pt-6 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-2xl h-12 px-8 font-bold text-gray-500 hover:bg-gray-100 transition-all">Hủy</Button>
                            <Button onClick={handleUpdateUser} className="bg-gray-900 hover:bg-black text-white font-black px-10 h-12 rounded-2xl uppercase tracking-tighter transition-all shadow-md">Lưu thông tin</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isAddOpen) {
        return (
            <div className="space-y-6 flex-1 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 mb-2">
                    <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold border-2">
                        Quay lại danh sách
                    </Button>
                </div>
                <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden rounded-3xl">
                    <div className="bg-gradient-to-r from-gray-800 to-black px-10 py-7">
                         <div className="text-white text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            Thêm thành viên mới
                         </div>
                    </div>
                    <CardContent className="p-10 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">Tên đăng nhập</Label>
                                <Input
                                    placeholder="giahuy123..."
                                    value={addData.username}
                                    onChange={(e) => setAddData({ ...addData, username: e.target.value })}
                                    className={`h-14 rounded-2xl border-2 transition-all font-bold ${errors.username ? "border-red-500 bg-red-50 shadow-red-50" : "focus:border-gray-900 focus:ring-4 focus:ring-gray-200"}`}
                                />
                                {errors.username && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.username}</p>}
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">Số điện thoại</Label>
                                <Input
                                    placeholder="0123xxx..."
                                    value={addData.phonenumber}
                                    onChange={(e) => setAddData({ ...addData, phonenumber: e.target.value })}
                                    className={`h-14 rounded-2xl border-2 transition-all font-bold ${errors.phonenumber ? "border-red-500 bg-red-50 shadow-red-50" : "focus:border-gray-900 focus:ring-4 focus:ring-gray-200"}`}
                                />
                                {errors.phonenumber && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phonenumber}</p>}
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">Địa chỉ Email</Label>
                            <Input
                                type="email"
                                placeholder="name@domain.com..."
                                value={addData.email}
                                onChange={(e) => setAddData({ ...addData, email: e.target.value })}
                                className={`h-14 rounded-2xl border-2 transition-all font-bold ${errors.email ? "border-red-500 bg-red-50 shadow-red-50" : "focus:border-gray-900 focus:ring-4 focus:ring-gray-200"}`}
                            />
                            {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">Mật khẩu truy cập</Label>
                            <div className="relative flex items-center">
                                <Input
                                    type={showAddPassword ? "text" : "password"}
                                    placeholder="..."
                                    value={addData.password}
                                    onChange={(e) => setAddData({ ...addData, password: e.target.value })}
                                    className={`h-14 rounded-2xl border-2 transition-all font-bold pr-12 ${errors.password ? "border-red-500 bg-red-50 shadow-red-50" : "focus:border-gray-900 focus:ring-4 focus:ring-gray-200"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => { setShowAddPassword(!showAddPassword); }}
                                    className="absolute right-4 text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    {showAddPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password}</p>}
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">Vị trí đảm nhiệm</Label>
                            <div className="flex flex-col gap-2 p-4 border-2 border-gray-100 rounded-2xl">
                                {['ADMIN', 'VENDOR', 'CUSTOMER', 'DRIVER'].map((roleItem) => (
                                    <Label key={roleItem} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                            checked={addData.roles.includes(roleItem)}
                                            onChange={(e) => {
                                                let newRoles = e.target.checked ? [...addData.roles, roleItem] : addData.roles.filter(r => r !== roleItem);
                                                if (roleItem === 'ADMIN' && e.target.checked) newRoles = ['ADMIN'];
                                                else if (roleItem !== 'ADMIN' && e.target.checked) newRoles = newRoles.filter(r => r !== 'ADMIN');
                                                setAddData({ ...addData, roles: newRoles });
                                            }}
                                        />
                                        <span className="font-bold text-sm text-gray-700">
                                            {roleItem === 'ADMIN' ? 'Phụ trách hệ thống (ADMIN)' :
                                             roleItem === 'VENDOR' ? 'Nhà cung cấp (VENDOR)' :
                                             roleItem === 'DRIVER' ? 'Tài xế (DRIVER)' :
                                             'Người dùng (CUSTOMER)'}
                                        </span>
                                    </Label>
                                ))}
                            </div>
                        </div>
                        <div className="pt-6 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-2xl h-12 px-8 font-bold text-gray-500 hover:bg-gray-100 transition-all">Hủy</Button>
                            <Button onClick={handleCreateUser} className="bg-gray-900 hover:bg-black text-white font-black px-12 h-12 rounded-2xl uppercase tracking-tighter transition-all shadow-md">Tạo tài khoản</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 flex-1 animate-in fade-in zoom-in-95 duration-300">

            <div className="flex justify-end mb-6">
                 <Button onClick={() => setIsAddOpen(true)} className="gap-2 bg-gray-900 hover:bg-black text-white font-bold shadow-lg shadow-gray-300 rounded-xl px-6 transition-all active:scale-95">
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
                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-full md:w-[160px] h-12 rounded-2xl border-gray-200 focus:ring-4 focus:ring-gray-200 font-bold bg-white">
                                    <SelectValue placeholder="Tất cả vai trò" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-gray-100 shadow-xl font-bold">
                                    <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                                    <SelectItem value="VENDOR">VENDOR</SelectItem>
                                    <SelectItem value="DRIVER">DRIVER</SelectItem>
                                    <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="relative w-full md:w-80 group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-gray-900" />
                                <Input
                                    type="search"
                                    placeholder="Tìm kiếm tên, email..."
                                    className="pl-11 h-12 rounded-2xl bg-white focus:ring-4 focus:ring-gray-200 border-gray-200 font-bold transition-all shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex h-80 items-center justify-center">
                            <div className="relative">
                                <Loader2 className="h-12 w-12 animate-spin text-gray-900" />
                                <div className="absolute inset-0 blur-xl bg-gray-500/20 animate-pulse rounded-full"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-gray-100/80 text-gray-500 text-[10px] uppercase font-black tracking-widest border-b">
                                    <tr>
                                        <th className="px-8 py-5">Thành viên</th>
                                        <th className="px-8 py-5">Vai trò hệ thống</th>

                                        <th className="px-8 py-5">Thông tin liên hệ</th>
                                        <th className="px-8 py-5 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
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
                                            <tr key={user.id} className="hover:bg-gray-100/50 transition-all group">
                                                <td className="px-8 py-5 align-middle">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <Avatar className="h-12 w-12 border-2 border-white shadow-md ring-2 ring-gray-100 transition-transform group-hover:scale-110">
                                                                <AvatarImage src={user.avatar || ""} />
                                                                <AvatarFallback className="bg-gradient-to-br from-gray-800 to-black text-white font-black text-xs">
                                                                    {user.username.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {user.isActive && <div className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-gray-900 text-base leading-tight tracking-tight">{user.username}</span>
                                                            <span className="text-[10px] text-gray-400 font-black uppercase flex items-center gap-1 mt-0.5">
                                                                <span className="text-gray-1000">ID:</span> #{user.id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 align-middle">
                                                    <div className="flex flex-col items-start gap-2">
                                                        {Array.from(new Set((user.roles as string[]) || []))?.map((role, idx) => {
                                                            if (role === 'ADMIN') {
                                                                return (
                                                                    <Badge key={idx} className="bg-red-50 text-red-600 border-red-100 border-2 hover:bg-red-100 transition-colors flex items-center gap-1.5 font-black rounded-xl px-3 py-1 text-[10px]">
                                                                        <ShieldCheck className="h-3 w-3" />
                                                                        ADMIN
                                                                    </Badge>
                                                                );
                                                            }
                                                            if (role === 'VENDOR') {
                                                                return (
                                                                    <Badge key={idx} className="bg-gray-100 text-black border-gray-200 border-2 hover:bg-gray-200 transition-colors flex items-center gap-1.5 font-black rounded-xl px-3 py-1 text-[10px]">
                                                                        <ShieldAlert className="h-3 w-3" />
                                                                        VENDOR
                                                                    </Badge>
                                                                );
                                                            }
                                                            if (role === 'DRIVER') {
                                                                return (
                                                                    <Badge key={idx} className="bg-blue-50 text-blue-600 border-blue-100 border-2 hover:bg-blue-100 transition-colors flex items-center gap-1.5 font-black rounded-xl px-3 py-1 text-[10px]">
                                                                        <UserPlus className="h-3 w-3" />
                                                                        DRIVER
                                                                    </Badge>
                                                                );
                                                            }
                                                            return (
                                                                <Badge key={idx} className="bg-gray-50 text-gray-600 border-gray-100 border-2 hover:bg-gray-100 transition-colors font-black rounded-xl px-3 py-1 text-[10px]">
                                                                    CUSTOMER
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 align-middle">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2 group/contact">
                                                            <div className="p-1.5 bg-gray-50 rounded-lg group-hover/contact:bg-gray-100 transition-colors">
                                                                <Mail className="h-3 w-3 text-gray-400 group-hover/contact:text-gray-900" />
                                                            </div>
                                                            <span className="text-xs font-black text-gray-700 truncate max-w-[150px]">{user.email || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 group/contact">
                                                            <div className="p-1.5 bg-gray-50 rounded-lg group-hover/contact:bg-gray-100 transition-colors">
                                                                <Phone className="h-3 w-3 text-gray-400 group-hover/contact:text-gray-900" />
                                                            </div>
                                                            <span className="text-[11px] font-bold text-gray-400 tracking-tight">{user.phonenumber || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 align-middle text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-2xl hover:bg-gray-100 hover:text-gray-900 border border-transparent hover:border-gray-200 transition-all active:scale-90">
                                                                <MoreHorizontal className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 min-w-[200px] animate-in slide-in-from-top-1 duration-200">
                                                            <DropdownMenuLabel className="text-[10px] uppercase font-black text-gray-400 px-4 py-3 tracking-widest">Trung tâm điều khiển</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsViewOpen(true); }} className="gap-3 rounded-xl focus:bg-gray-100 focus:text-gray-900 cursor-pointer font-bold px-4 py-3">
                                                                <Eye className="h-4 w-4" /> Xem hồ sơ chi tiết
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openEditModal(user)} className="gap-3 rounded-xl focus:bg-gray-100 focus:text-gray-900 cursor-pointer font-bold px-4 py-3">
                                                                <Edit className="h-4 w-4" /> Chỉnh sửa thông tin
                                                            </DropdownMenuItem>
                                                            
                                                            {!user.isApprovedVendor && (user.vendorRequestPending || user.roles?.includes('VENDOR')) && (
                                                                <DropdownMenuItem
                                                                    className={cn(
                                                                        "rounded-xl focus:text-white cursor-pointer font-bold px-4 py-3",
                                                                        user.vendorRequestPending ? "bg-yellow-50 text-yellow-700 focus:bg-yellow-600" : "text-black focus:bg-gray-900"
                                                                    )}
                                                                    onClick={() => handleToggleVendorStatus(user.id, user.isApprovedVendor)}
                                                                >
                                                                    <ShieldCheck className="h-4 w-4" />
                                                                    {user.vendorRequestPending ? 'Phê duyệt Vendor ngay' : 'Cấp quyền Vendor'}
                                                                </DropdownMenuItem>
                                                            )}
                                                            
                                                            <DropdownMenuSeparator className="my-2 bg-gray-50" />
                                                            
                                                            <DropdownMenuItem
                                                                className={`rounded-xl font-bold cursor-pointer px-4 py-3 transition-colors ${(user.isActive && (!user.lockedRoles || user.lockedRoles.length === 0)) ? "text-gray-900 focus:bg-gray-100 focus:text-gray-900" : "text-orange-600 focus:bg-orange-50 focus:text-orange-600"}`}
                                                                onClick={() => handleLockAccount(user)}
                                                            >
                                                                {(!user.isActive || (user.lockedRoles && user.lockedRoles.length > 0)) ? (
                                                                    <><Unlock className="h-4 w-4" /> Quản lý Mở khóa</>
                                                                ) : (
                                                                    <><Lock className="h-4 w-4" /> Khóa tài khoản / Phân quyền</>
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

            <Dialog open={isLockDialogOpen} onOpenChange={setIsLockDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl max-h-[85vh] overflow-y-auto scrollbar-hide">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter text-gray-900">Khóa tài khoản</DialogTitle>
                        <DialogDescription className="font-medium">
                            Vui lòng cho biết lý do bạn muốn khóa tài khoản này. Người dùng sẽ thấy lý do này khi họ cố gắng đăng nhập.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase text-gray-500 tracking-wider">Phạm vi khóa</Label>
                            <div className="flex flex-col gap-2 p-4 border-2 border-gray-100 rounded-2xl bg-gray-50/50">
                                <Label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                    <input
                                        type="radio"
                                        name="lockType"
                                        className="w-5 h-5 border-gray-300 text-gray-900 focus:ring-gray-900"
                                        checked={lockType === 'FULL'}
                                        onChange={() => setLockType('FULL')}
                                    />
                                    <span className="font-bold text-sm text-gray-700">Khóa toàn bộ tài khoản</span>
                                </Label>
                                <Label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                    <input
                                        type="radio"
                                        name="lockType"
                                        className="w-5 h-5 border-gray-300 text-gray-900 focus:ring-gray-900"
                                        checked={lockType === 'PARTIAL'}
                                        onChange={() => setLockType('PARTIAL')}
                                    />
                                    <span className="font-bold text-sm text-gray-700">Khóa theo vai trò (Partial Lock)</span>
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase text-gray-500 tracking-wider">Thời hạn khóa</Label>
                            <Select value={lockDurationDays.toString()} onValueChange={(val) => setLockDurationDays(Number(val))}>
                                <SelectTrigger className="w-full h-12 rounded-2xl border-gray-200 focus:ring-4 focus:ring-gray-200 font-bold bg-white">
                                    <SelectValue placeholder="Chọn thời hạn" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-gray-100 shadow-xl font-bold">
                                    <SelectItem value="1">1 ngày</SelectItem>
                                    <SelectItem value="3">3 ngày</SelectItem>
                                    <SelectItem value="7">7 ngày</SelectItem>
                                    <SelectItem value="30">1 tháng (30 ngày)</SelectItem>
                                    <SelectItem value="0">Khóa vĩnh viễn (0)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {lockType === 'PARTIAL' && userToLockData && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-xs font-black uppercase text-gray-500 tracking-wider">Chọn vai trò để khóa & Lý do</Label>
                                <div className="flex flex-col gap-4">
                                    {userToLockData.roles.map((role) => (
                                        <div key={role} className="flex flex-col gap-2 p-4 border-2 border-orange-100 rounded-2xl bg-orange-50/30 transition-all">
                                            <Label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                                                    checked={rolesToLock.includes(role)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        if (checked) {
                                                            setRolesToLock([...rolesToLock, role]);
                                                            setRoleReasonsState(prev => ({ ...prev, [role]: { selected: [], custom: "", isCustom: false } }));
                                                        } else {
                                                            setRolesToLock(rolesToLock.filter(r => r !== role));
                                                            setRoleReasonsState(prev => {
                                                                const newState = { ...prev };
                                                                delete newState[role];
                                                                return newState;
                                                            });
                                                        }
                                                    }}
                                                />
                                                <span className="font-bold text-sm text-gray-700 uppercase">{role}</span>
                                            </Label>
                                            
                                            {rolesToLock.includes(role) && (
                                                <div className="mt-2 pl-8 flex flex-col gap-2 animate-in fade-in">
                                                    {(ROLE_REASONS[role] || PREDEFINED_REASONS).map((reason) => (
                                                        <Label key={`${role}-${reason}`} className="flex items-center gap-3 cursor-pointer p-1 hover:bg-orange-100/50 rounded-lg transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                                                                checked={roleReasonsState[role]?.selected.includes(reason) || false}
                                                                onChange={(e) => {
                                                                    const state = roleReasonsState[role] || { selected: [], custom: "", isCustom: false };
                                                                    const newSelected = e.target.checked 
                                                                        ? [...state.selected, reason] 
                                                                        : state.selected.filter(r => r !== reason);
                                                                    setRoleReasonsState({ ...roleReasonsState, [role]: { ...state, selected: newSelected } });
                                                                }}
                                                            />
                                                            <span className="text-xs font-medium text-gray-700">{reason}</span>
                                                        </Label>
                                                    ))}
                                                    <Label className="flex items-center gap-3 cursor-pointer p-1 hover:bg-orange-100/50 rounded-lg transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                                                            checked={roleReasonsState[role]?.isCustom || false}
                                                            onChange={(e) => {
                                                                const state = roleReasonsState[role] || { selected: [], custom: "", isCustom: false };
                                                                setRoleReasonsState({ ...roleReasonsState, [role]: { ...state, isCustom: e.target.checked } });
                                                            }}
                                                        />
                                                        <span className="text-xs font-medium text-gray-700">Lý do khác...</span>
                                                    </Label>
                                                    {roleReasonsState[role]?.isCustom && (
                                                        <Input
                                                            placeholder={`Nhập lý do khóa ${role}...`}
                                                            value={roleReasonsState[role]?.custom || ""}
                                                            onChange={(e) => {
                                                                const state = roleReasonsState[role] || { selected: [], custom: "", isCustom: false };
                                                                setRoleReasonsState({ ...roleReasonsState, [role]: { ...state, custom: e.target.value } });
                                                            }}
                                                            className="h-10 mt-1 rounded-xl border-gray-200 text-xs font-medium"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {userToLockData.roles.length === 0 && (
                                        <div className="p-4 border-2 border-gray-100 rounded-2xl bg-gray-50/50">
                                            <span className="text-xs italic text-gray-500">Tài khoản này chưa có vai trò nào.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {lockType === 'FULL' && (
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase text-gray-500 tracking-wider">Chọn lý do khóa toàn bộ</Label>
                                <div className="flex flex-col gap-2 p-4 border-2 border-gray-100 rounded-2xl bg-gray-50/50">
                                    {PREDEFINED_REASONS.map((reason) => (
                                        <Label key={reason} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                                checked={selectedReasons.includes(reason)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedReasons([...selectedReasons, reason]);
                                                    } else {
                                                        setSelectedReasons(selectedReasons.filter(r => r !== reason));
                                                    }
                                                }}
                                            />
                                            <span className="font-bold text-sm text-gray-700">{reason}</span>
                                        </Label>
                                    ))}
                                    <Label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                            checked={isCustomReason}
                                            onChange={(e) => setIsCustomReason(e.target.checked)}
                                        />
                                        <span className="font-bold text-sm text-gray-700">Lý do khác...</span>
                                    </Label>
                                </div>
                                
                                {isCustomReason && (
                                    <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                                        <Label htmlFor="custom-reason" className="text-xs font-black uppercase text-gray-500 tracking-wider">Nhập lý do khác</Label>
                                        <Input
                                            id="custom-reason"
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            placeholder="VD: Vi phạm quy định spam tin nhắn..."
                                            className="h-12 rounded-xl font-bold border-2 focus:ring-4 focus:ring-gray-200"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsLockDialogOpen(false)} className="rounded-xl font-bold">Hủy</Button>
                        <Button onClick={confirmLockAccount} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold">Khóa tài khoản</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isUnlockDialogOpen} onOpenChange={setIsUnlockDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl overflow-hidden bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter text-gray-900">Chi tiết khóa tài khoản</DialogTitle>
                        <DialogDescription className="font-medium text-gray-500">
                            Thông tin chi tiết về lệnh khóa đối với tài khoản <span className="font-bold text-gray-900">{userToUnlock?.username}</span>
                        </DialogDescription>
                    </DialogHeader>
                    
                    {userToUnlock && (
                        <div className="grid gap-4 py-4">
                            {!userToUnlock.isActive ? (
                                <div className="space-y-3 bg-red-50 p-4 rounded-2xl border border-red-100">
                                    <div className="flex items-center gap-2 text-red-600 font-bold uppercase text-xs tracking-wider">
                                        <Lock className="w-4 h-4" /> Khóa toàn bộ
                                    </div>
                                    <div className="text-sm font-medium text-gray-800">
                                        <span className="text-gray-500 mr-2">Lý do:</span> 
                                        {userToUnlock.lockReason || "Không có lý do"}
                                    </div>
                                </div>
                            ) : userToUnlock.lockedRoles && userToUnlock.lockedRoles.length > 0 ? (
                                <div className="space-y-3 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                    <div className="flex items-center gap-2 text-orange-600 font-bold uppercase text-xs tracking-wider">
                                        <Lock className="w-4 h-4" /> Khóa một phần (Vai trò)
                                    </div>
                                    <div className="space-y-2 mt-2">
                                        {userToUnlock.lockedRoles.map(role => (
                                            <div key={role} className="bg-white p-3 rounded-xl border border-orange-100/50 relative pr-24">
                                                <Badge variant="outline" className="mb-2 bg-orange-100 text-orange-700 border-0">{role}</Badge>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="absolute top-3 right-3 text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-7 text-xs font-bold px-2 rounded-lg"
                                                    onClick={() => handleUnlockSingleRole(role)}
                                                >
                                                    <Unlock className="w-3 h-3 mr-1" /> Gỡ riêng
                                                </Button>
                                                <div className="text-sm font-medium text-gray-700">
                                                    <span className="text-gray-500 text-xs mr-2 block mb-1">Lý do:</span>
                                                    {userToUnlock.roleLockReasons?.[role] || "Không có lý do"}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {userToUnlock.lockUntil && (
                                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-gray-500 text-sm font-bold uppercase tracking-wider text-xs">Thời hạn:</span>
                                    <span className="text-gray-900 font-bold text-sm">
                                        Đến {new Date(userToUnlock.lockUntil).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsUnlockDialogOpen(false)} className="rounded-xl font-bold">Đóng</Button>
                        <Button onClick={confirmUnlockAccount} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2">
                            <Unlock className="w-4 h-4" /> 
                            {userToUnlock && !userToUnlock.isActive ? "Mở khóa toàn bộ" : "Xóa bỏ khóa vai trò"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
