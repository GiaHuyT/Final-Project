import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET') || 'ANTIGRAVITY_FALLBACK_SECRET',
    });
  }

  async validate(payload: any) {
    console.log('[JwtStrategy] Payload sub:', payload.sub);
    const user = await this.usersService.findById(Number(payload.sub));
    
    if (!user) {
      console.error('[JwtStrategy] Không tìm thấy user với id:', payload.sub);
      throw new UnauthorizedException('User not found');
    }

    console.log('[JwtStrategy] Tìm thấy user, ID gốc:', user.id);
    
    // Nếu là ADMIN, quy mọi hoạt động về tài khoản showroom chính (Main Admin)
    let vendorId = Number(user.id);
    if (user.roles && user.roles.includes('ADMIN')) {
      const mainAdminId = await this.usersService.getMainAdminId();
      if (mainAdminId) {
        vendorId = mainAdminId;
      }
    }
    
    // Đảm bảo trả về một plain object có chứa id
    return {
      id: Number(user.id),
      vendorId: vendorId, // ID dùng để query danh sách xe, đấu giá (quy về 1 cho Admin)
      username: user.username,
      email: user.email,
      roles: user.roles,
      avatar: user.avatar,
      phonenumber: user.phonenumber,
      isActive: user.isActive,
      lockedRoles: (user as any).lockedRoles || []
    };
  }
}
