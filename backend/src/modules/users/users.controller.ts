import { Controller, Get, Patch, Body, Req, UseGuards, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { Public } from '../../core/decorators/public.decorator';
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

  @Public()
  @Get('check-route')
  checkRoute() {
    return { status: 'UsersController is active' };
  }

  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.update(req.user.id, updateProfileDto);
  }

  @Post('avatar')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/uploads/avatars',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `avatar-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
    },
  }))
  @ApiOperation({ summary: 'Upload avatar' })
  async uploadAvatar(@Req() req, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const avatarUrl = `http://localhost:3000/uploads/avatars/${file.filename}`;
    await this.usersService.update(req.user.id, { avatar: avatarUrl });
    return { avatarUrl };
  }
}
