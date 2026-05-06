import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(userId: number, data: { targetId: number; targetType?: string; rating?: number; content?: string }) {
    const { targetId, targetType = 'VENDOR', rating, content } = data;

    if (!targetId) {
      throw new BadRequestException('Target ID is required');
    }

    const results = [];

    // Case 1: Handle Rating (Updateable)
    if (rating !== undefined && rating >= 1 && rating <= 5) {
      // If targetType is PRODUCT, verify if user has bought it
      if (targetType === 'PRODUCT') {
        const hasBought = await this.prisma.order.findFirst({
          where: {
            customerId: userId,
            status: { not: 'PENDING' }, // Or any status that signifies a successful transaction
            items: {
              some: { productId: targetId }
            }
          }
        });

        if (!hasBought) {
          throw new BadRequestException('Bạn chỉ có thể đánh giá sao cho sản phẩm đã mua.');
        }
      }

      // Find existing rating record for this user-target pair
      const existingRating = await this.prisma.review.findFirst({
        where: {
          userId,
          targetId,
          targetType,
          ...(targetType === 'PRODUCT' ? { productId: targetId } : {}),
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
            targetType,
            ...(targetType === 'PRODUCT' ? { productId: targetId } : {}),
            rating,
            content: '', // Empty content for rating-only record
          },
        });
        results.push({ type: 'rating', data: created });
      }
    }

    // Case 2: Handle Comment (Multiple times, anyone can comment)
    if (content && content.trim() !== '') {
      const created = await this.prisma.review.create({
        data: {
          userId,
          targetId,
          targetType,
          ...(targetType === 'PRODUCT' ? { productId: targetId } : {}),
          rating: 0, 
          content: content.trim(),
        },
      });
      results.push({ type: 'comment', data: created });
    }

    // Notify the vendor if it's a vendor review, or notify the product owner if product review
    try {
      const reviewer = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });

      const messageType = content ? 'bình luận' : 'đánh giá';
      
      if (targetType === 'VENDOR') {
        await this.notifications.create(targetId, {
          type: NotificationType.REVIEW,
          content: `Bạn nhận được một ${messageType} mới từ ${reviewer?.username || 'khách hàng'}`,
          link: `/vendor/${targetId}`,
          metadata: { reviewerId: userId },
        });
      } else if (targetType === 'PRODUCT') {
        const product = await this.prisma.product.findUnique({ where: { id: targetId } });
        if (product) {
          await this.notifications.create(product.vendorId, {
            type: NotificationType.REVIEW,
            content: `Sản phẩm ${product.name} nhận được một ${messageType} mới từ ${reviewer?.username || 'khách hàng'}`,
            link: `/products/${targetId}`,
            metadata: { reviewerId: userId, productId: targetId },
          });
        }
      }
    } catch (err) {
      console.error('Failed to send review notification:', err);
    }

    return { message: 'Đánh giá thành công', results };
  }

  async findByVendorId(vendorId: number) {
    // Get all comments and ratings
    const reviews = await this.prisma.review.findMany({
      where: { targetId: vendorId, targetType: 'VENDOR' },
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

  async findByProductId(productId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { targetId: productId, targetType: 'PRODUCT' },
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

    const ratingRecords = reviews.filter((r) => r.rating > 0);
    const commentRecords = reviews.filter((r) => r.content !== '');

    const avgRating =
      ratingRecords.length > 0
        ? ratingRecords.reduce((acc, curr) => acc + curr.rating, 0) / ratingRecords.length
        : 0;

    return {
      averageRating: Number(avgRating.toFixed(1)),
      totalRatings: ratingRecords.length,
      reviews: commentRecords,
    };
  }

  async getUserRatingForVendor(userId: number, vendorId: number) {
    const ratingRecord = await this.prisma.review.findFirst({
      where: {
        userId,
        targetId: vendorId,
        targetType: 'VENDOR',
        rating: { gt: 0 },
      },
      select: { rating: true },
    });
    return ratingRecord ? ratingRecord.rating : 0;
  }

  async getUserRatingForProduct(userId: number, productId: number) {
    const ratingRecord = await this.prisma.review.findFirst({
      where: {
        userId,
        targetId: productId,
        targetType: 'PRODUCT',
        rating: { gt: 0 },
      },
      select: { rating: true },
    });
    return ratingRecord ? ratingRecord.rating : 0;
  }

  async delete(userId: number, id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new BadRequestException('Review not found');
    }

    if (review.userId !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }
}
