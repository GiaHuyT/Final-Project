import { Controller, Get, Patch, Body, Req, UseGuards, Post, UseInterceptors, UploadedFile, BadRequestException, Param, Delete, Query } from '@nestjs/common';
import { IsString, IsOptional, IsEmail, MinLength, Allow } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { Public } from '../../core/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

class UpdateProfileDto {
  @ApiProperty({ example: 'Gia Huy', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: '0123456789', required: false })
  @IsString()
  @IsOptional()
  phonenumber?: string;

  @ApiProperty({ example: 'url_to_avatar', required: false })
  @Allow()
  @IsOptional()
  avatar?: string | null;
}

class UpdateUserDto extends UpdateProfileDto {
  @ApiProperty({ example: 'user@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'password123', required: false })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'ADMIN', required: false })
  @IsString()
  @IsOptional()
  role?: string;
}

class CreateUserDto {
  @ApiProperty({ example: 'newuser' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'newuser@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0987654321' })
  @IsString()
  phonenumber: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'CUSTOMER' })
  @IsString()
  role: string;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Public()
  @Get('vendor/:id')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ công khai của nhà cung cấp' })
  findVendorById(@Param('id') id: string) {
    return this.usersService.findVendorPublicProfile(+id);
  }

  @Public()
  @Get('vendors')
  @ApiOperation({ summary: 'Lấy tất cả nhà cung cấp (Public)' })
  findVendors() {
    return this.usersService.findVendors();
  }

  @Get('admin/support')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin admin hỗ trợ' })
  getSupportAdmin(@Req() req) {
    return this.usersService.getSupportAdmin(req.user.id);
  }

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
    if (!req.user || !req.user.id) {
       throw new BadRequestException('Không tìm thấy ID người dùng trong phiên làm việc. Hãy thử đăng xuất và đăng nhập lại.');
    }
    return this.usersService.update(req.user.id, updateProfileDto);
  }

  @Post('apply-vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gửi yêu cầu đăng ký làm Nhà cung cấp (Vendor)' })
  applyVendor(@Req() req) {
    return this.usersService.applyVendor(req.user.id);
  }

  @Post('apply-driver')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gửi yêu cầu đăng ký làm Tài xế' })
  applyDriver(@Req() req, @Body() body: any) {
    return this.usersService.applyDriver(req.user.id, body);
  }

  @Patch('switch-role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chuyển đổi vai trò' })
  switchRole(@Req() req, @Body('role') role: string) {
    return this.usersService.switchRole(req.user.id, role);
  }

  @Post('avatar')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  @ApiOperation({ summary: 'Upload avatar' })
  async uploadAvatar(@Req() req, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    
    // Upload thẳng lên Cloudinary từ buffer (RAM)
    const result = await this.cloudinaryService.uploadFile(file, 'final-project/avatars');
    return { avatarUrl: result.secure_url };
  }
  @Post('verify-document')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify uploaded document using AI' })
  async verifyDocument(@Body() body: { imageUrl: string, documentType: string }) {
    if (!body.imageUrl || !body.documentType) {
      throw new BadRequestException('imageUrl and documentType are required');
    }
    const check = await this.usersService['aiService'].verifyDocumentImage(body.imageUrl, body.documentType);
    if (!check.isValid) {
      throw new BadRequestException(check.reason);
    }
    return { success: true };
  }

  @Public()
  @Get('check-route')
  checkRoute() {
    return { status: 'UsersController is active' };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy tất cả người dùng (Admin)' })
  findAll(@Query() query: any) {
    const { vendorRequestPending, driverRequestPending } = query;
    const isPendingVendor = vendorRequestPending === 'true';
    const isPendingDriver = driverRequestPending === 'true';
    return this.usersService.findAll(
      vendorRequestPending !== undefined ? isPendingVendor : undefined,
      driverRequestPending !== undefined ? isPendingDriver : undefined
    );
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo người dùng mới (Admin)' })
  create(@Body() data: CreateUserDto) {
    return this.usersService.create(data as any);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy chi tiết người dùng cụ thể (Admin)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Patch(':id/role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật vai trò người dùng (Admin)' })
  updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(+id, role);
  }

  @Patch(':id/approve-vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Phê duyệt quyền Vendor cho người dùng (Admin)' })
  approveVendor(@Param('id') id: string, @Body('isApproved') isApproved: boolean) {
    return this.usersService.updateStatus(+id, isApproved);
  }

  @Patch(':id/approve-driver')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Phê duyệt quyền Tài xế cho người dùng (Admin)' })
  approveDriver(@Param('id') id: string, @Body('isApproved') isApproved: boolean) {
    return this.usersService.updateDriverStatus(+id, isApproved);
  }

  @Patch(':id/toggle-active')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khóa/Mở khóa tài khoản (Admin)' })
  toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng bất kỳ (Admin)' })
  updateAny(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.usersService.update(+id, data as any);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa tài khoản người dùng (Admin)' })
  remove(@Param('id') id: string) {
    return this.usersService.delete(+id);
  }
}
