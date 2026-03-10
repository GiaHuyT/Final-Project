import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuctionsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.auction.findMany({
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
                    orderBy: { createdAt: 'desc' }
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
}
