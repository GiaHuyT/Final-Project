import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { RolesGuard } from '../auth/passport/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('vendor/revenue')
  @Roles(Role.VENDOR)
  async getVendorRevenue(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: string,
  ) {
    const vendorId = req.user.id;
    return this.reportsService.getVendorRevenueReport(vendorId, startDate, endDate, groupBy);
  }

  @Get('admin/revenue')
  @Roles(Role.ADMIN)
  async getAdminRevenue(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: string,
  ) {
    return this.reportsService.getAdminRevenueReport(startDate, endDate, groupBy);
  }
}
