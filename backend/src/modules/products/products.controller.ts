import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
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
}
