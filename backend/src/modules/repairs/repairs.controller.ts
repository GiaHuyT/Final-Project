import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { RepairsService } from './repairs.service';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { CreateRepairDto } from './dto/create-repair.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Repairs')
@Controller('repairs')
@UseGuards(JwtAuthGuard)
export class RepairsController {
    constructor(private readonly repairsService: RepairsService) { }

    @Post()
    create(@Request() req: any, @Body() dto: CreateRepairDto) {
        return this.repairsService.create(req.user.id, dto);
    }

    @Get('vendor/me')
    findByVendor(@Request() req: any) {
        return this.repairsService.findByVendor(req.user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: any) {
        return this.repairsService.update(+id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.repairsService.remove(+id);
    }
}
