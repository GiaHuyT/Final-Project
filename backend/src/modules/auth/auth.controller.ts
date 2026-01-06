import { Controller, Post, Body} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../auth/dto/login.dto';
import { Public } from '../../core/decorators/public.decorator';
import { RegisterDto } from '../auth/dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.identifier, body.password);
  }
}
