import { Controller, Get, Patch, Post, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { Public } from '../../core/decorators/public.decorator';

import { ProductsService } from './products.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Lấy tất cả sản phẩm' })
    findAll(@Query() query: any) {
        return this.productsService.findAll({
            brand: query.brand,
            modelName: query.modelName,
            vendorId: query.vendorId ? parseInt(query.vendorId) : undefined,
            minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
            maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
            sortBy: query.sortBy,
        });
    }

    @Get('vendor/me')
    @ApiOperation({ summary: 'Lấy sản phẩm của nhà cung cấp hiện tại' })
    findByVendor(@Request() req: any) {
        return this.productsService.findByVendorId(req.user.id);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết sản phẩm' })
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(+id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Cập nhật trạng thái sản phẩm' })
    updateStatus(@Param('id') id: string, @Body('status') status: boolean) {
        return this.productsService.updateStatus(+id, status);
    }

    @Post()
    @ApiOperation({ summary: 'Thêm sản phẩm mới' })
    create(@Request() req: any, @Body() data: any) {
        const vendorId = req.user.role === 'ADMIN' && data.vendorId 
            ? parseInt(data.vendorId) 
            : req.user.id;
        return this.productsService.create(vendorId, data);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật sản phẩm' })
    update(@Param('id') id: string, @Request() req: any, @Body() data: any) {
        const vendorId = req.user.role === 'ADMIN' && data.vendorId 
            ? parseInt(data.vendorId) 
            : req.user.id;
        return this.productsService.update(+id, vendorId, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa sản phẩm' })
    remove(@Param('id') id: string) {
        return this.productsService.remove(+id);
    }
}
