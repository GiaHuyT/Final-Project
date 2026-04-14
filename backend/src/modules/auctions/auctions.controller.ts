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

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.auctionsService.findOne(+id);
  }
}
