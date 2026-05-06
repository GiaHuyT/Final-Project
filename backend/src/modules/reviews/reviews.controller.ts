import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Public } from '../../core/decorators/public.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('vendor/:id')
  async findByVendorId(@Param('id') id: string) {
    return this.reviewsService.findByVendorId(Number(id));
  }

  @Public()
  @Get('product/:id')
  async findByProductId(@Param('id') id: string) {
    return this.reviewsService.findByProductId(Number(id));
  }

  @Post()
  async create(@Req() req: any, @Body() body: { targetId: number; targetType?: string; rating?: number; content?: string }) {
    const userId = req.user.id;
    return this.reviewsService.create(userId, body);
  }

  @Get('user/rating/vendor/:vendorId')
  async getUserRatingForVendor(@Req() req: any, @Param('vendorId') vendorId: string) {
    const userId = req.user.id;
    return this.reviewsService.getUserRatingForVendor(userId, Number(vendorId));
  }

  @Get('user/rating/product/:productId')
  async getUserRatingForProduct(@Req() req: any, @Param('productId') productId: string) {
    const userId = req.user.id;
    return this.reviewsService.getUserRatingForProduct(userId, Number(productId));
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.reviewsService.delete(userId, Number(id));
  }
}
