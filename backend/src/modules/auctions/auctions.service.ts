import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class AuctionsService {
    constructor(
        private prisma: PrismaService,
        private transactionsService: TransactionsService
    ) { }

    async findAll(status?: string) {
        const where: any = {};
        if (status) where.status = status;

        return this.prisma.auction.findMany({
            where,
            include: {
                vendor: {
                    select: { username: true, email: true }
                },
                _count: {
                    select: { bids: true }
                }
            }
        });
    }

    async findOne(id: number) {
        return this.prisma.auction.findUnique({
            where: { id },
            include: {
                vendor: {
                    select: { username: true, email: true }
                },
                bids: {
                    include: {
                        user: {
                            select: { username: true }
                        }
                    },
                    orderBy: { bidAmount: 'desc' }
                }
            }
        });
    }

    async updateStatus(id: number, status: string) {
        return this.prisma.auction.update({
            where: { id },
            data: { status }
        });
    }

    async payForAuction(auctionId: number, userId: number) {
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId },
            include: {
                bids: {
                    orderBy: { bidAmount: 'desc' },
                    take: 1
                }
            }
        });

        if (!auction) {
            throw new BadRequestException('Không tìm thấy phiên đấu giá.');
        }

        if (auction.status !== 'FINISHED' && auction.status !== 'COMPLETED') {
            throw new BadRequestException('Phiên đấu giá chưa kết thúc.');
        }

        if (auction.bids.length === 0 || auction.bids[0].userId !== userId) {
            throw new BadRequestException('Bạn không phải là người chiến thắng trong phiên đấu giá này.');
        }

        const winningBid = auction.bids[0];

        return this.transactionsService.createTransactionForAuction(
            auction.id,
            winningBid.bidAmount,
            `Thanh toan trúng đấu giá ${auction.id}`
        );
    }
}
