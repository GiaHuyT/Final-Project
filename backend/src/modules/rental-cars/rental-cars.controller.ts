import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { RentalCarsService } from './rental-cars.service';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { CreateRentalCarDto } from './dto/create-rental-car.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('RentalCars')
@Controller('rental-cars')
@UseGuards(JwtAuthGuard)
export class RentalCarsController {
    constructor(private readonly rentalCarsService: RentalCarsService) { }

    @Post()
    create(@Request() req: any, @Body() dto: CreateRentalCarDto) {
        return this.rentalCarsService.create(req.user.id, dto);
    }

    @Get('vendor/me')
    findByVendor(@Request() req: any) {
        return this.rentalCarsService.findByVendor(req.user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: any) {
        return this.rentalCarsService.update(+id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.rentalCarsService.remove(+id);
    }
}
