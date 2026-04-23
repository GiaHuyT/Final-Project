import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DriverRentalService } from './driver-rental.service';
import { CreateDriverRentalDto } from './dto/create-driver-rental.dto';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';

@Controller('driver-rental')
export class DriverRentalController {
  constructor(private readonly driverRentalService: DriverRentalService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createDto: CreateDriverRentalDto) {
    return this.driverRentalService.create(req.user.id, createDto);
  }

  @Get('public')
  findAllPublic() {
    return this.driverRentalService.findAllPublic();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req, @Param('id') id: string, @Body() updateDto: any) {
    return this.driverRentalService.update(+id, req.user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.driverRentalService.remove(+id, req.user.id);
  }
}
