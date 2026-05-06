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
    return this.auctionsService.create(req.user.vendorId || req.user.id, createAuctionDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateAuctionDto: Partial<CreateAuctionDto>) {
    return this.auctionsService.update(+id, req.user.vendorId || req.user.id, updateAuctionDto);
  }

  @Public()
  @Get()
  async findAll(@Request() req: any, @Query('status') status?: string) {
    const data = await this.auctionsService.findAll(status);
    console.log("findAll requested");
    console.log("Auction 8 regs:", JSON.stringify(data.find((a: any) => a.id === 8)?.registrations));
    return data;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('vendor/me')
  async findMyAuctions(@Request() req) {
    return this.auctionsService.findByVendorId(req.user.vendorId || req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('customer/me')
  async getCustomerAuctionHistory(@Request() req) {
    return this.auctionsService.getMyAuctionHistory(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/register')
  async register(@Request() req, @Param('id') id: string) {
    return this.auctionsService.registerForAuction(+id, req.user.id);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const auction = await this.auctionsService.findOne(+id);
    return { ...auction, serverTime: new Date().toISOString() };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/registrations')
  async getRegistrations(@Request() req, @Param('id') id: string) {
    const isAdmin = req.user.roles?.includes('ADMIN');
    return this.auctionsService.getRegistrations(+id, req.user.vendorId || req.user.id, isAdmin);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/registrations/:regId/approve')
  async approveRegistration(@Request() req, @Param('id') id: string, @Param('regId') regId: string) {
    const isAdmin = req.user.roles?.includes('ADMIN');
    return this.auctionsService.approveRegistration(+id, +regId, req.user.vendorId || req.user.id, isAdmin);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/registrations/:regId/reject')
  async rejectRegistration(@Request() req, @Param('id') id: string, @Param('regId') regId: string) {
    const isAdmin = req.user.roles?.includes('ADMIN');
    return this.auctionsService.rejectRegistration(+id, +regId, req.user.vendorId || req.user.id, isAdmin);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/items/:itemId/start')
  async startItemBidding(@Request() req, @Param('id') id: string, @Param('itemId') itemId: string) {
    return this.auctionsService.setActiveItem(+id, req.user.vendorId || req.user.id, +itemId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/items/:itemId/end')
  async endItemBidding(@Request() req, @Param('id') id: string, @Param('itemId') itemId: string) {
    return this.auctionsService.endActiveItem(+id, req.user.vendorId || req.user.id, +itemId);
  }
}
