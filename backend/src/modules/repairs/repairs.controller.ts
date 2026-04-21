import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { Public } from '../../core/decorators/public.decorator';
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

    @Post('capacity')
    createCapacity(@Request() req: any, @Body() dto: any) {
        return this.repairsService.createCapacity(req.user.id, dto);
    }

    @Get('capacity/vendor/me')
    getCapacitiesByVendor(@Request() req: any) {
        return this.repairsService.getCapacitiesByVendor(req.user.id);
    }

    @Public()
    @Get('capacity/public')
    getAllCapacities() {
        return this.repairsService.getAllCapacities();
    }

    @Patch('capacity/:id')
    updateCapacity(@Param('id') id: string, @Body() dto: any) {
        return this.repairsService.updateCapacity(+id, dto);
    }

    @Delete('capacity/:id')
    deleteCapacity(@Param('id') id: string) {
        return this.repairsService.deleteCapacity(+id);
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
