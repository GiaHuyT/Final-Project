import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
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
        return requiredRoles.some((role) => user.roles.includes(role));
    }
}
