import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createDto: CreateMaintenanceDto) {
    return this.maintenanceService.create(req.user.id, createDto);
  }

  @Get('public')
  findAllPublic() {
    return this.maintenanceService.findAllPublic();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req, @Param('id') id: string, @Body() updateDto: any) {
    return this.maintenanceService.update(+id, req.user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.maintenanceService.remove(+id, req.user.id);
  }
}
