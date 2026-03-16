import { Controller, Get, Patch, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy tất cả sản phẩm' })
    findAll() {
        return this.productsService.findAll();
    }

    @Get('vendor/me')
    @ApiOperation({ summary: 'Lấy sản phẩm của nhà cung cấp hiện tại' })
    findByVendor(@Request() req: any) {
        return this.productsService.findByVendorId(req.user.id);
    }

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
        return this.productsService.create(req.user.id, data);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật sản phẩm' })
    update(@Param('id') id: string, @Request() req: any, @Body() data: any) {
        return this.productsService.update(+id, req.user.id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa sản phẩm' })
    remove(@Param('id') id: string) {
        return this.productsService.remove(+id);
    }
}
