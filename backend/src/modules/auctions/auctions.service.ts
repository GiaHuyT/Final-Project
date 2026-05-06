import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuctionsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly transactionsService: TransactionsService,
        private readonly notifications: NotificationsService
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
                status: 'ACTIVE',
                items: {
                    create: dto.items.map(i => ({
                        productId: i.productId,
                        orderIndex: i.orderIndex || 0,
                        startPrice: i.startPrice || dto.startPrice,
                        currentPrice: i.startPrice || dto.startPrice,
                        bidStep: i.bidStep || dto.bidStep || 0,
                        itemDescription: i.itemDescription || null
                    }))
                }
            },
            include: {
                items: { include: { product: { include: { images: true } } } }
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
                items: { include: { product: { include: { images: true } } } },
                registrations: { select: { userId: true, status: true } },
                _count: { select: { bids: true } }
            },
            orderBy: { startTime: 'desc' }
        });
    }

    async findByVendorId(vendorId: number) {
        return this.prisma.auction.findMany({
            where: { vendorId },
            include: {
                vendor: { select: { username: true, email: true } },
                items: { include: { product: { include: { images: true } } } },
                registrations: { select: { userId: true, status: true } },
                _count: { select: { bids: true } }
            },
            orderBy: { startTime: 'desc' }
        });
    }

    async update(id: number, vendorId: number, dto: Partial<CreateAuctionDto>) {
        const auction = await this.prisma.auction.findUnique({ where: { id } });
        if (!auction) throw new NotFoundException('Không tìm thấy phiên đấu giá.');
        if (auction.vendorId !== vendorId) throw new BadRequestException('Bạn không có quyền chỉnh sửa phiên đấu giá này.');

        // Kiểm tra thời gian: Chỉ được sửa trước khi bắt đầu 5 phút
        const now = new Date();
        const startTime = new Date(auction.startTime);
        const timeDiff = startTime.getTime() - now.getTime(); // thời gian còn lại đến khi bắt đầu (ms)

        if (timeDiff < 5 * 60 * 1000) {
            throw new BadRequestException('Chỉ được chỉnh sửa thông tin trước khi phiên đấu giá bắt đầu 5 phút.');
        }

        // Nếu có cập nhật items
        if (dto.items && dto.items.length > 0) {
            // Xóa items cũ
            await this.prisma.auctionItem.deleteMany({ where: { auctionId: id } });
            // Cập nhật thông tin và tạo items mới
            return this.prisma.auction.update({
                where: { id },
                data: {
                    title: dto.title,
                    description: dto.description,
                    startPrice: dto.startPrice,
                    currentPrice: dto.startPrice,
                    bidStep: dto.bidStep,
                    type: dto.type,
                    streamUrl: dto.streamUrl,
                    startTime: dto.startTime,
                    endTime: dto.endTime,
                    items: {
                        create: dto.items.map(i => ({
                            productId: i.productId,
                            orderIndex: i.orderIndex || 0,
                            startPrice: i.startPrice || dto.startPrice,
                            currentPrice: i.startPrice || dto.startPrice,
                            bidStep: i.bidStep || dto.bidStep || 0,
                            itemDescription: i.itemDescription || null
                        }))
                    }
                },
                include: { items: { include: { product: { include: { images: true } } } } }
            });
        }

        // Nếu không cập nhật items
        return this.prisma.auction.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                startPrice: dto.startPrice,
                currentPrice: dto.startPrice,
                bidStep: dto.bidStep,
                type: dto.type,
                streamUrl: dto.streamUrl,
                startTime: dto.startTime,
                endTime: dto.endTime,
            },
            include: { items: { include: { product: { include: { images: true } } } } }
        });
    }

    async findOne(id: number) {
        return this.prisma.auction.findUnique({
            where: { id },
            include: {
                vendor: { select: { id: true, username: true, email: true } },
                items: { include: { product: { include: { images: true } } } },
                registrations: { select: { userId: true, status: true } },
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

        const registration = await this.prisma.auctionRegistration.findUnique({
            where: { auctionId_userId: { auctionId, userId } }
        });
        if (!registration || registration.status !== 'APPROVED') {
            throw new BadRequestException('Bạn chưa được duyệt để tham gia phiên đấu giá này.');
        }

        let latestBid: number;
        let requiredBid: number;
        let activeItemId: number | null = null;

        if (auction.type === 'LIVESTREAM') {
            if (!auction.currentActiveItemId) {
                throw new BadRequestException('Chưa có xe nào đang được lên sóng để đấu giá.');
            }
            activeItemId = auction.currentActiveItemId;
            const activeItem = auction.items.find(i => i.id === activeItemId);
            if (!activeItem) throw new BadRequestException('Lỗi dữ liệu xe đang đấu giá.');

            latestBid = activeItem.currentPrice || activeItem.startPrice || 0;
            requiredBid = latestBid + (activeItem.bidStep || 0);
        } else {
            latestBid = auction.currentPrice || auction.startPrice;
            requiredBid = latestBid + auction.bidStep;
        }

        if (bidAmount < requiredBid) {
            throw new BadRequestException(`Mức giá phải lớn hơn hoặc bằng ${requiredBid.toLocaleString()} VNĐ`);
        }

        // Sniper protection: If bid is placed within the last 5 minutes, reset remaining time to 5 minutes
        const now = new Date();
        const endTime = new Date(auction.endTime);
        const timeDiff = endTime.getTime() - now.getTime();
        let newEndTime = endTime;

        if (timeDiff > 0 && timeDiff <= 5 * 60 * 1000) {
            newEndTime = new Date(now.getTime() + 5 * 60 * 1000);
        }

        const transactionOperations: any[] = [
            this.prisma.auctionBid.create({
                data: {
                    auctionId,
                    userId,
                    bidAmount: Number(bidAmount),
                    auctionItemId: activeItemId,
                },
                include: { user: { select: { id: true, username: true } } }
            })
        ];

        if (auction.type === 'LIVESTREAM' && activeItemId) {
            transactionOperations.push(
                this.prisma.auctionItem.update({
                    where: { id: activeItemId },
                    data: { currentPrice: Number(bidAmount) }
                })
            );
            transactionOperations.push(
                this.prisma.auction.update({
                    where: { id: auctionId },
                    data: { currentPrice: Number(bidAmount), endTime: newEndTime }
                })
            );
        } else {
            transactionOperations.push(
                this.prisma.auction.update({
                    where: { id: auctionId },
                    data: { currentPrice: Number(bidAmount), endTime: newEndTime },
                })
            );
        }

        const results = await this.prisma.$transaction(transactionOperations);
        const bid = results[0];
        const updatedAuction = results[results.length - 1];

        return { bid, auction: updatedAuction };
    }

    async getMyAuctionHistory(userId: number) {
        return this.prisma.auctionRegistration.findMany({
            where: { userId },
            include: {
                auction: {
                    include: {
                        vendor: { select: { username: true, email: true } },
                        items: { include: { product: { include: { images: true } } } },
                        winner: { select: { id: true, username: true } },
                        _count: { select: { registrations: true, bids: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async registerForAuction(auctionId: number, userId: number) {
        const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
        if (!auction) throw new NotFoundException('Không tìm thấy phiên đấu giá.');

        if (auction.vendorId === userId) {
            throw new BadRequestException('Bạn là chủ sở hữu, không cần đăng ký tham gia.');
        }

        const existing = await this.prisma.auctionRegistration.findUnique({
            where: { auctionId_userId: { auctionId, userId } }
        });

        if (existing) {
            throw new BadRequestException('Bạn đã gửi yêu cầu đăng ký cho phiên này rồi.');
        }

        const registration = await this.prisma.auctionRegistration.create({
            data: { auctionId, userId, status: 'PENDING' }
        });

        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        await this.notifications.create(auction.vendorId, {
            type: 'AUCTION' as any,
            content: `Người dùng ${user?.username || 'khách'} vừa gửi yêu cầu tham gia phiên đấu giá "${auction.title}". Vui lòng kiểm tra và duyệt!`,
            link: `/vendor/auctions/${auction.id}/registrations`
        });

        return registration;
    }

    async getRegistrations(auctionId: number, vendorId: number, isAdmin: boolean = false) {
        const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
        if (!auction) throw new NotFoundException('Không tìm thấy phiên đấu giá.');
        if (!isAdmin && auction.vendorId !== vendorId) throw new BadRequestException('Không có quyền truy cập danh sách này.');

        return this.prisma.auctionRegistration.findMany({
            where: { auctionId },
            include: { user: { select: { id: true, username: true, email: true, phonenumber: true, avatar: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async approveRegistration(auctionId: number, registrationId: number, vendorId: number, isAdmin: boolean = false) {
        // Validation check
        const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
        if (!auction || (!isAdmin && auction.vendorId !== vendorId)) throw new BadRequestException('Lỗi quyền truy cập');

        const registration = await this.prisma.auctionRegistration.update({
            where: { id: registrationId },
            data: { status: 'APPROVED' }
        });

        await this.notifications.create(registration.userId, {
            type: 'AUCTION' as any,
            content: `Yêu cầu tham gia phiên đấu giá "${auction.title}" của bạn đã ĐƯỢC DUYỆT. Bạn đã có quyền đặt giá!`,
            link: `/auctions/${auction.id}`
        });

        return registration;
    }

    async rejectRegistration(auctionId: number, registrationId: number, vendorId: number, isAdmin: boolean = false) {
        // Validation check
        const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
        if (!auction || (!isAdmin && auction.vendorId !== vendorId)) throw new BadRequestException('Lỗi quyền truy cập');

        const registration = await this.prisma.auctionRegistration.update({ // Force TS recheck
            where: { id: registrationId },
            data: { status: 'REJECTED' }
        });

        await this.notifications.create(registration.userId, {
            type: 'AUCTION' as any,
            content: `Yêu cầu tham gia phiên đấu giá "${auction.title}" của bạn đã BỊ TỪ CHỐI bởi chủ tài sản.`,
            link: `/auctions/${auction.id}`
        });

        return registration;
    }

    async triggerPaymentForWinner(auctionId: number) {
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId }
        });
        if (!auction || !auction.winnerId || !auction.currentPrice) return null;

        const depositAmount = Math.max(2000, Math.round(auction.currentPrice * 0.00001));

        return this.transactionsService.createTransactionForAuction(
            auction.id,
            depositAmount,
            `Coc xe dau gia ${auction.id}`
        );
    }

    // --- LIVESTREAM CONTROL METHODS ---
    async setActiveItem(auctionId: number, vendorId: number, itemId: number) {
        const auction = await this.findOne(auctionId);
        if (!auction) throw new NotFoundException('Không tìm thấy phiên đấu giá.');
        if (auction.vendorId !== vendorId) throw new BadRequestException('Bạn không có quyền.');
        if (auction.type !== 'LIVESTREAM') throw new BadRequestException('Chỉ áp dụng cho Livestream.');
        if (auction.status !== 'ACTIVE') throw new BadRequestException('Phiên đấu giá không trong trạng thái ACTIVE.');

        const item = auction.items.find(i => i.id === itemId);
        if (!item) throw new NotFoundException('Không tìm thấy xe trong phiên.');
        if (item.status === 'SOLD' || item.status === 'PASSED') {
            throw new BadRequestException('Xe này đã được chốt giá hoặc bỏ qua.');
        }

        if (auction.currentActiveItemId && auction.currentActiveItemId !== itemId) {
            throw new BadRequestException('Vui lòng chốt xe đang đấu trước khi chuyển sang xe mới.');
        }

        await this.prisma.$transaction([
            this.prisma.auction.update({
                where: { id: auctionId },
                data: { currentActiveItemId: itemId, breakEndsAt: null }
            }),
            this.prisma.auctionItem.update({
                where: { id: itemId },
                data: { status: 'ACTIVE' }
            })
        ]);

        return this.findOne(auctionId);
    }

    async endActiveItem(auctionId: number, vendorId: number, itemId: number) {
        const auction = await this.findOne(auctionId);
        if (!auction) throw new NotFoundException('Không tìm thấy phiên đấu giá.');
        if (auction.vendorId !== vendorId) throw new BadRequestException('Bạn không có quyền.');
        if (auction.currentActiveItemId !== itemId) throw new BadRequestException('Xe này không phải là xe đang được đấu.');

        const item = auction.items.find(i => i.id === itemId);
        if (!item) throw new NotFoundException('Không tìm thấy xe.');

        const highestBid = await this.prisma.auctionBid.findFirst({
            where: { auctionId, auctionItemId: itemId },
            orderBy: { bidAmount: 'desc' }
        });

        let newStatus = highestBid ? 'SOLD' : 'PASSED';

        const nextItem = await this.prisma.auctionItem.findFirst({
            where: { auctionId, status: 'PENDING' },
            orderBy: { orderIndex: 'asc' }
        });

        const breakEndsAt = nextItem ? new Date(Date.now() + 60000) : null;

        await this.prisma.$transaction([
            this.prisma.auctionItem.update({
                where: { id: itemId },
                data: { 
                    status: newStatus,
                    winnerId: highestBid ? highestBid.userId : null
                }
            }),
            this.prisma.auction.update({
                where: { id: auctionId },
                data: { currentActiveItemId: null, breakEndsAt }
            })
        ]);

        if (nextItem) {
            setTimeout(async () => {
                const checkAuction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
                if (checkAuction && checkAuction.status === 'ACTIVE' && checkAuction.currentActiveItemId === null && checkAuction.breakEndsAt) {
                    const timeDiff = checkAuction.breakEndsAt.getTime() - Date.now();
                    // If breakEndsAt is passed and no active item, start next item
                    if (timeDiff <= 5000) { // 5s buffer
                        try {
                            await this.setActiveItem(auctionId, vendorId, nextItem.id);
                            console.log(`Auto-started next item ${nextItem.id} for auction ${auctionId}`);
                        } catch (e) {
                            console.error(`Failed to auto-start next item:`, e);
                        }
                    }
                }
            }, 60000);
        } else {
            // No next item, auto end auction
            setTimeout(async () => {
                 const checkAuction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
                 if (checkAuction && checkAuction.status === 'ACTIVE' && checkAuction.currentActiveItemId === null) {
                     // Let the Cron job (Step 2) handle the conclusion so it properly assigns winnerId and triggers payment
                     await this.prisma.auction.update({
                         where: { id: auctionId },
                         data: { endTime: new Date() } // Do NOT set WAITING_PAYMENT here
                     });
                     console.log(`Set endTime to now for auction ${auctionId} to let Cron job conclude it`);
                 }
            }, 5000); // 5 second delay to let clients see the final bid before ending
        }

        return this.findOne(auctionId);
    }
}
