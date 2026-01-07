import { Controller, Post, Body} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../core/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { ForgotPasswordDto } from '../auth/dto/forgot-password';
import { ResetPasswordDto } from './dto/reset-password';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiResponse({ status: 200, description: 'Login successful, JWT token returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.identifier, body.password);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Send reset password email' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
