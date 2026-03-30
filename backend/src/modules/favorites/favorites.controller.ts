import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle/:productId')
  @ApiOperation({ summary: 'Thêm/Xóa sản phẩm khỏi danh sách yêu thích' })
  toggle(@Request() req: any, @Param('productId') productId: string) {
    return this.favoritesService.toggle(req.user.id, +productId);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả sản phẩm yêu thích của người dùng' })
  findAll(@Request() req: any) {
    return this.favoritesService.findAll(req.user.id);
  }

  @Get('ids')
  @ApiOperation({ summary: 'Lấy danh sách ID sản phẩm người dùng đã yêu thích' })
  getFavoriteIds(@Request() req: any) {
    return this.favoritesService.getFavoriteIds(req.user.id);
  }
}
