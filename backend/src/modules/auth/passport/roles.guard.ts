import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../core/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Nếu không yêu cầu role nào thì cho qua
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        // Nếu không có user (do route Public hoặc lỗi JWT) mà lại yêu cầu Role thì chặn
        if (!user || !user.roles || user.roles.length === 0) {
            return false;
        }

        // Kiểm tra xem user có ít nhất một role nằm trong danh sách yêu cầu không
        const hasRole = requiredRoles.some((role) => user.roles.includes(role));
        if (!hasRole) return false;

        // Nếu là request thay đổi dữ liệu (POST, PUT, PATCH, DELETE)
        // Kiểm tra xem user có đang dùng một role đã bị khóa hay không
        const req = context.switchToHttp().getRequest();
        if (req.method !== 'GET' && user.lockedRoles && user.lockedRoles.length > 0) {
            const isUsingLockedRole = requiredRoles.some(role => user.lockedRoles.includes(role));
            if (isUsingLockedRole) {
                throw new ForbiddenException(`Tính năng ${requiredRoles.join(', ')} của bạn đã bị khóa.`);
            }
        }

        return true;
    }
}
