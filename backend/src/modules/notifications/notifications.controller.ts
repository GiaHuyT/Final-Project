import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { Public } from '../../core/decorators/public.decorator';

@Controller('notifications')
// @UseGuards(JwtAuthGuard) // Bỏ chặn JwtAuthGuard nếu cần, hoặc dùng cho toàn bộ class
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.findAll(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.markAllAsRead(userId);
  }
}
