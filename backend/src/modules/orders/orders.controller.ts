import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy tất cả đơn hàng' })
    findAll() {
        return this.ordersService.findAll();
    }

    @Get('vendor/me')
    @ApiOperation({ summary: 'Lấy đơn hàng của nhà cung cấp hiện tại' })
    findByVendor(@Request() req: any) {
        return this.ordersService.findByVendorId(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết đơn hàng' })
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(+id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.ordersService.updateStatus(+id, status);
    }
}
