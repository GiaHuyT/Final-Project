import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Lấy dữ liệu thống kê dashboard' })
    getStats() {
        return this.dashboardService.getStats();
    }
}
