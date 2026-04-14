import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';

@Injectable()
export class AuctionsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly transactionsService: TransactionsService
    ) { }

    async create(vendorId: number, dto: CreateAuctionDto) {
        // Kiểm tra logic tạo phòng (Ví dụ streamKey nếu là WebRTC)
        let streamKey = null;
        if (dto.type === 'LIVESTREAM' && !dto.streamUrl) {
           streamKey = `live_${vendorId}_${Date.now()}`;
        }

        return this.prisma.auction.create({
            data: {
                title: dto.title,
                description: dto.description,
                startPrice: dto.startPrice,
                currentPrice: dto.startPrice,
                bidStep: dto.bidStep || 0,
                type: dto.type || 'OFFLINE',
                streamUrl: dto.streamUrl,
                streamKey: streamKey,
                startTime: dto.startTime,
                endTime: dto.endTime,
                vendorId,
                status: 'PENDING',
                items: {
                    create: dto.items.map(i => ({
                        productId: i.productId,
                        orderIndex: i.orderIndex || 0
                    }))
                }
            },
            include: {
                items: { include: { product: true } }
            }
        });
    }

    async findAll(status?: string) {
        const where: any = {};
        if (status) where.status = status;

        return this.prisma.auction.findMany({
            where,
            include: {
                vendor: { select: { username: true, email: true } },
                items: { include: { product: true } },
                _count: { select: { bids: true } }
            },
            orderBy: { startTime: 'desc' }
        });
    }

    async findOne(id: number) {
        return this.prisma.auction.findUnique({
            where: { id },
            include: {
                vendor: { select: { id: true, username: true, email: true } },
                items: { include: { product: true } },
                winner: { select: { id: true, username: true, email: true } },
                bids: {
                    include: { user: { select: { id: true, username: true } } },
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

    // Handle placing a bid
    async placeBid(auctionId: number, userId: number, bidAmount: number) {
        const auction = await this.findOne(auctionId);
        if (!auction) throw new NotFoundException('Không tìm thấy phiên đấu giá.');
        if (auction.status !== 'ACTIVE') throw new BadRequestException('Phiên đấu giá chưa mở hoặc đã kết thúc.');
        if (auction.vendorId === userId) throw new BadRequestException('Bạn không thể đặt giá cho tài sản của chính mình.');

        const latestBid = auction.currentPrice || auction.startPrice;
        const requiredBid = latestBid + auction.bidStep;

        if (bidAmount < requiredBid) {
            throw new BadRequestException(`Mức giá phải lớn hơn hoặc bằng ${requiredBid.toLocaleString()} VNĐ`);
        }

        // Sniper protection: If bid is placed within the last 2 minutes, extend by 5 minutes
        const now = new Date();
        const endTime = new Date(auction.endTime);
        const timeDiff = endTime.getTime() - now.getTime();
        let newEndTime = endTime;

        if (timeDiff > 0 && timeDiff <= 2 * 60 * 1000) {
            newEndTime = new Date(endTime.getTime() + 5 * 60 * 1000);
        }

        const [bid, updatedAuction] = await this.prisma.$transaction([
            this.prisma.auctionBid.create({
                data: {
                    auctionId,
                    userId,
                    bidAmount: Number(bidAmount),
                },
                include: { user: { select: { id: true, username: true } } }
            }),
            this.prisma.auction.update({
                where: { id: parseInt(auctionId.toString()) },
                data: {
                    currentPrice: Number(bidAmount),
                    endTime: newEndTime,
                },
            }),
        ]);

        return { bid, auction: updatedAuction };
    }

    async triggerPaymentForWinner(auctionId: number) {
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId }
        });
        if (!auction || !auction.winnerId || !auction.currentPrice) return null;

        const tenPercentDeposit = auction.currentPrice * 0.1;

        return this.transactionsService.createTransactionForAuction(
            auction.id,
            tenPercentDeposit,
            `Thanh toan coc 10% trung dau gia xe`
        );
    }
}
