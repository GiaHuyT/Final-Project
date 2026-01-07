"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Tự động chuyển hướng về trang đăng nhập
    router.push("/auth/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Đang chuyển hướng...</h1>
        <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
}
