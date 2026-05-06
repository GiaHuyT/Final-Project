import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const userRoleCookie = request.cookies.get('user_role')?.value;
    const pathname = request.nextUrl.pathname;

    const protectedRoutes = ['/profile', '/admin', '/vendor', '/driver'];
    const isProtectedRoute = protectedRoutes.some(path => pathname === path || pathname.startsWith(path + '/'));

    // 1. Kiểm tra đăng nhập
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 2. Parse roles từ cookie
    let roles: string[] = [];
    if (userRoleCookie) {
        try {
            roles = JSON.parse(userRoleCookie);
        } catch (e) {
            // Hỗ trợ trường hợp cookie cũ lưu dạng string đơn lẻ
            roles = [userRoleCookie];
        }
    }

    // 3. Nếu là Admin, bắt buộc phải ở trang quản trị (trừ khi đang vào trang auth hoặc xem các trang public cần thiết như auctions)
    if (token && roles.includes('ADMIN') && !pathname.startsWith('/admin') && !pathname.startsWith('/auth') && !pathname.startsWith('/auctions')) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // 4. Kiểm tra quyền truy cập cho từng khu vực
    if (pathname.startsWith('/admin') && !roles.includes('ADMIN')) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    
    if (pathname.startsWith('/vendor') && !roles.includes('VENDOR')) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    
    if ((pathname === '/driver' || pathname.startsWith('/driver/')) && !roles.includes('DRIVER')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Chạy middleware trên tất cả các route ngoại trừ tài nguyên tĩnh và api
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}
