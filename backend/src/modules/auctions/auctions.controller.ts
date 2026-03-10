import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';

@ApiTags('Auctions')
@Controller('auctions')
@UseGuards(JwtAuthGuard)
export class AuctionsController {
    constructor(private readonly auctionsService: AuctionsService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy tất cả đấu giá' })
    findAll() {
        return this.auctionsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết đấu giá' })
    findOne(@Param('id') id: string) {
        return this.auctionsService.findOne(+id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Cập nhật trạng thái đấu giá' })
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.auctionsService.updateStatus(+id, status);
    }
}
