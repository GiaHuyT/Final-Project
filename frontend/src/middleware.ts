import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // 1. Lấy token từ Cookie (Không dùng được localStorage ở đây)
    const token = request.cookies.get('token')?.value

    const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
    const isProtectedRoute = ['/profile'].some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    // 2. Nếu vào trang bảo vệ mà không có token -> Đá về Login
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // 3. Nếu đã đăng nhập mà cố vào trang Login/Register -> Đá về Trang chủ
    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

// Chỉ chạy middleware cho các đường dẫn này
export const config = {
    matcher: ['/profile/:path*', '/auth/:path*'],
}