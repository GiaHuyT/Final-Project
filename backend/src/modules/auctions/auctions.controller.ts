import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, Query } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { RolesGuard } from '../auth/passport/roles.guard';
import { Public } from '../../core/decorators/public.decorator';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Request() req, @Body() createAuctionDto: CreateAuctionDto) {
    return this.auctionsService.create(req.user.id, createAuctionDto);
  }

  @Public()
  @Get()
  async findAll(@Query('status') status?: string) {
    return this.auctionsService.findAll(status);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/register')
  async register(@Request() req, @Param('id') id: string) {
    return this.auctionsService.registerForAuction(+id, req.user.id);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.auctionsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/registrations')
  async getRegistrations(@Request() req, @Param('id') id: string) {
    return this.auctionsService.getRegistrations(+id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/registrations/:regId/approve')
  async approveRegistration(@Request() req, @Param('id') id: string, @Param('regId') regId: string) {
    return this.auctionsService.approveRegistration(+id, +regId, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/registrations/:regId/reject')
  async rejectRegistration(@Request() req, @Param('id') id: string, @Param('regId') regId: string) {
    return this.auctionsService.rejectRegistration(+id, +regId, req.user.id);
  }
}
