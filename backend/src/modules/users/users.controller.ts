import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { UsersService } from './users.service';

class UpdateProfileDto {
  @ApiProperty({ example: 'Gia Huy', required: false })
  username?: string;

  @ApiProperty({ example: '0123456789', required: false })
  phonenumber?: string;
}

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current logged-in user data' })
  @ApiResponse({ status: 401, description: 'Unauthorized. JWT invalid or missing' })
  getProfile(@Req() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.update(req.user.id, updateProfileDto);
  }
}
