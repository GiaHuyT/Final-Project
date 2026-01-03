import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../auth/dto/login.dto';
import { Public } from '../../core/decorators/public.decorator';
import { RegisterDto } from '../auth/dto/register.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { ValidationPipe, UsePipes } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    return this.authService.generateToken(req.user);
  }
}
