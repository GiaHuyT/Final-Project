import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ActiveGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const user = req.user;

        // Nếu không có user, bỏ qua (đã có JwtAuthGuard lo)
        if (!user) {
            return true;
        }

        // Nếu tài khoản không bị khóa, cho qua
        if (user.isActive !== false) {
            return true;
        }

        // --- Từ đây trở xuống là TÀI KHOẢN BỊ KHÓA ---

        // Chỉ cho phép GET (Read-Only)
        if (req.method === 'GET') {
            return true;
        }

        // Cho phép một số API POST/PATCH đặc biệt để họ vẫn thao tác cơ bản được
        const whitelistedUrls = [
            '/auth/logout',
            '/auth/refresh-token',
            '/users/switch-role', // Để đổi vai trò trên Topbar
            '/contacts', // Để gửi form liên hệ/khiếu nại
        ];

        // Nếu URL nằm trong danh sách ngoại lệ, cho qua
        if (whitelistedUrls.some(url => req.url.includes(url))) {
            return true;
        }

        // Còn lại chặn hết tất cả thao tác làm thay đổi dữ liệu
        throw new ForbiddenException({
            message: 'Tài khoản của bạn đã bị khóa toàn bộ tính năng, không thể thực hiện thao tác này.',
            isLocked: true
        });
    }
}
