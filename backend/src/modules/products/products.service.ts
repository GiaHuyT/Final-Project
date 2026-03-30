import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async findAll(options?: {
        brand?: string;
        modelName?: string;
        vendorId?: number;
        minPrice?: number;
        maxPrice?: number;
        status?: boolean;
        sortBy?: string;
    }) {
        console.log('[ProductsService] findAll options:', options);
        const where: any = {};
        if (options?.brand) where.brand = options.brand;
        if (options?.modelName) where.modelName = options.modelName;
        if (options?.vendorId) where.vendorId = options.vendorId;
        if (options?.status !== undefined) where.status = options.status;
        if (options?.minPrice !== undefined || options?.maxPrice !== undefined) {
            where.price = {};
            if (options.minPrice !== undefined) where.price.gte = options.minPrice;
            if (options.maxPrice !== undefined) where.price.lte = options.maxPrice;
        }

        let orderBy: any = { createdAt: 'desc' }; // Default
        if (options?.sortBy === 'price_asc') orderBy = { price: 'asc' };
        if (options?.sortBy === 'price_desc') orderBy = { price: 'desc' };
        if (options?.sortBy === 'newest') orderBy = { createdAt: 'desc' };

        return this.prisma.product.findMany({
            where,
            orderBy,
            include: {
                category: true,
                // @ts-ignore
                images: true,
                // @ts-ignore
                colorVariants: {
                    include: {
                        images: true
                    }
                },
                vendor: {
                    select: { username: true, email: true }
                }
            }
        });
    }

    async findByVendorId(vendorId: number) {
        return this.prisma.product.findMany({
            where: { vendorId },
            include: {
                category: true,
                // @ts-ignore
                images: true,
                // @ts-ignore
                colorVariants: {
                    include: {
                        images: true
                    }
                },
            }
        });
    }

    async findOne(id: number) {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                // @ts-ignore
                images: true,
                // @ts-ignore
                colorVariants: {
                    include: {
                        images: true
                    }
                },
                vendor: {
                    select: { username: true, email: true }
                }
            }
        });
    }

    async updateStatus(id: number, status: boolean) {
        return this.prisma.product.update({
            where: { id },
            data: { status }
        });
    }

    async create(vendorId: number, data: any) {
        const { colorVariants, images, ...productData } = data;
        return this.prisma.product.create({
            data: { 
                ...productData, 
                vendorId, 
                categoryId: parseInt(data.categoryId),
                // @ts-ignore
                images: images && images.length > 0 ? {
                    create: images.map((url: string) => ({ url }))
                } : undefined,
                // @ts-ignore
                colorVariants: colorVariants && colorVariants.length > 0 ? {
                    create: colorVariants.map((cv: any) => ({
                        color: cv.color,
                        images: {
                            create: cv.images.map((url: string) => ({ url }))
                        }
                    }))
                } : undefined
            }
        });
    }

    async update(id: number, vendorId: number, data: any) {
        const { colorVariants, images, ...productData } = data;
        
        // If colorVariants or images are provided, we replace them
        if (colorVariants) {
            // @ts-ignore
            await this.prisma.productColorVariant.deleteMany({
                where: { productId: id }
            });
        }
        if (images) {
            // @ts-ignore
            await this.prisma.productImage.deleteMany({
                where: { productId: id }
            });
        }

        return this.prisma.product.update({
            where: { id },
            data: { 
                ...productData, 
                vendorId,
                categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
                // @ts-ignore
                images: images && images.length > 0 ? {
                    create: images.map((url: string) => ({ url }))
                } : undefined,
                // @ts-ignore
                colorVariants: colorVariants && colorVariants.length > 0 ? {
                    create: colorVariants.map((cv: any) => ({
                        color: cv.color,
                        images: {
                            create: cv.images.map((url: string) => ({ url }))
                        }
                    }))
                } : undefined
            }
        });
    }

    async remove(id: number) {
        return this.prisma.product.delete({
            where: { id }
        });
    }
}
