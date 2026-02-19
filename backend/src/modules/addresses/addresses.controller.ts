import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) { }

    @Post()
    create(@Request() req, @Body() createAddressDto: CreateAddressDto) {
        return this.addressesService.create(req.user.id, createAddressDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.addressesService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.addressesService.findOne(req.user.id, +id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateAddressDto: Partial<CreateAddressDto>) {
        return this.addressesService.update(req.user.id, +id, updateAddressDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.addressesService.remove(req.user.id, +id);
    }
}
