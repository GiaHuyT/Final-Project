import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: { targetId: number; rating?: number; content?: string }) {
    const { targetId, rating, content } = data;

    if (!targetId) {
      throw new BadRequestException('Target ID (Vendor ID) is required');
    }

    const results = [];

    // Case 1: Handle Rating (Updateable)
    if (rating !== undefined && rating >= 1 && rating <= 5) {
      // Find existing rating record for this user-vendor pair
      // We define a "rating record" as a record that has a rating > 0
      // To keep it clean, let's say each user has one "primary" review record for rating
      const existingRating = await this.prisma.review.findFirst({
        where: {
          userId,
          targetId,
          rating: { gt: 0 },
        },
      });

      if (existingRating) {
        const updated = await this.prisma.review.update({
          where: { id: existingRating.id },
          data: { rating },
        });
        results.push({ type: 'rating', data: updated });
      } else {
        const created = await this.prisma.review.create({
          data: {
            userId,
            targetId,
            rating,
            content: '', // Empty content for rating-only record
          },
        });
        results.push({ type: 'rating', data: created });
      }
    }

    // Case 2: Handle Comment (Multiple times)
    if (content && content.trim() !== '') {
      const created = await this.prisma.review.create({
        data: {
          userId,
          targetId,
          rating: 0, // 0 means no rating attached to this specific comment record
          content: content.trim(),
        },
      });
      results.push({ type: 'comment', data: created });
    }

    if (results.length === 0) {
      throw new BadRequestException('Rating or Content must be provided');
    }

    return { message: 'Đánh giá thành công', results };
  }

  async findByVendorId(vendorId: number) {
    // Get all comments and ratings
    const reviews = await this.prisma.review.findMany({
      where: { targetId: vendorId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const ratingRecords = reviews.filter((r) => r.rating > 0);
    const commentRecords = reviews.filter((r) => r.content !== '');

    const avgRating =
      ratingRecords.length > 0
        ? ratingRecords.reduce((acc, curr) => acc + curr.rating, 0) / ratingRecords.length
        : 0;

    return {
      averageRating: Number(avgRating.toFixed(1)),
      totalRatings: ratingRecords.length,
      reviews: commentRecords, // Return only records with comments for the list
    };
  }

  async getUserRatingForVendor(userId: number, vendorId: number) {
    const ratingRecord = await this.prisma.review.findFirst({
      where: {
        userId,
        targetId: vendorId,
        rating: { gt: 0 },
      },
      select: { rating: true },
    });
    return ratingRecord ? ratingRecord.rating : 0;
  }
}
