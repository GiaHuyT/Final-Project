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
    
    // Đảm bảo trả về một plain object có chứa id
    return {
      id: Number(user.id),
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phonenumber: user.phonenumber
    };
  }
}
