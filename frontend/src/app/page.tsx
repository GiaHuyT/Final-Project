"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-blue-600">Auction & E-commerce</h1>
        <p className="text-gray-600 text-lg">Chào mừng bạn đến với hệ thống đấu giá trực tuyến</p>

        <div className="flex gap-4 justify-center mt-6">
          {isLoggedIn ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">Bạn đã đăng nhập!</p>
              <div className="flex gap-2">
                 {/* <Link href="/profile" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  Vào trang cá nhân
                </Link> */}
                 <button 
                  onClick={() => {
                    Cookies.remove('token');
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded shadow hover:bg-blue-50 transition"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
