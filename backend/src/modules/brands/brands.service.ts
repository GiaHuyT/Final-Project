import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({
      include: {
        models: {
          include: {
            variants: true,
          },
        },
      },
      orderBy: { name: 'asc' }, // Sort alphabetically
    });
  }
}
