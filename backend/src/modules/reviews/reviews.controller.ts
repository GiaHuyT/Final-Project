import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
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

  @Post()
  async create(@Req() req: any, @Body() body: { targetId: number; rating?: number; content?: string }) {
    const userId = req.user.id;
    return this.reviewsService.create(userId, body);
  }

  @Get('user/rating/:vendorId')
  async getUserRatingForVendor(@Req() req: any, @Param('vendorId') vendorId: string) {
    const userId = req.user.id;
    return this.reviewsService.getUserRatingForVendor(userId, Number(vendorId));
  }
}
