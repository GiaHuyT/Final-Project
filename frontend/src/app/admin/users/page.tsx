"use client";

import { UsersTab } from "@/components/admin/UsersTab";
import { UserApprovalsTab } from "@/components/admin/UserApprovalsTab";
import { DriverApprovalsTab } from "@/components/admin/DriverApprovalsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShieldCheck, Car } from "lucide-react";

export default function UserManagementPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý tài khoản</h1>
                <p className="text-muted-foreground mt-2">
                    Xem danh sách thành viên, quản lý quyền và phê duyệt yêu cầu từ người dùng.
                </p>
            </div>

            <Tabs defaultValue="list" className="w-full">
                <TabsList className="mb-6 h-auto p-1.5 bg-gray-100/80 rounded-2xl">
                    <TabsTrigger 
                        value="list" 
                        className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-gray-900 transition-all font-bold gap-2 text-gray-600"
                    >
                        <Users className="w-4 h-4" />
                        Danh sách thành viên
                    </TabsTrigger>
                    <TabsTrigger 
                        value="approvals" 
                        className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-gray-900 transition-all font-bold gap-2 text-gray-600"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Phê duyệt Vendor
                    </TabsTrigger>
                    <TabsTrigger 
                        value="driver-approvals" 
                        className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-gray-900 transition-all font-bold gap-2 text-gray-600"
                    >
                        <Car className="w-4 h-4" />
                        Phê duyệt Tài xế
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="list" className="m-0 focus-visible:outline-none">
                    <UsersTab />
                </TabsContent>
                <TabsContent value="approvals" className="m-0 focus-visible:outline-none">
                    <UserApprovalsTab />
                </TabsContent>
                <TabsContent value="driver-approvals" className="m-0 focus-visible:outline-none">
                    <DriverApprovalsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
