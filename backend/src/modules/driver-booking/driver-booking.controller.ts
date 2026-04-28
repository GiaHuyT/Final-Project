import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { DriverBookingService } from './driver-booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { RolesGuard } from '../auth/passport/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { DriverBookingGateway } from './driver-booking.gateway';

@Controller('driver-booking')
export class DriverBookingController {
  constructor(
    private readonly bookingService: DriverBookingService,
    private readonly gateway: DriverBookingGateway
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createDto: CreateBookingDto) {
    return this.bookingService.createBooking(req.user.id, createDto);
  }

  @Get('customer')
  @UseGuards(JwtAuthGuard)
  getCustomerBookings(@Request() req) {
    return this.bookingService.getCustomerBookings(req.user.id);
  }

  @Get('driver')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DRIVER')
  getDriverBookings(@Request() req) {
    return this.bookingService.getDriverBookings(req.user.id);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DRIVER')
  getPendingBookings() {
    return this.bookingService.getPendingBookings();
  }

  @Post(':id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DRIVER')
  async acceptBooking(@Request() req, @Param('id') id: string) {
    const booking = await this.bookingService.acceptBooking(req.user.id, +id);
    this.gateway.notifyRideAccepted(booking);
    return booking;
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DRIVER')
  async updateStatus(@Request() req, @Param('id') id: string, @Body('status') status: string) {
    const booking = await this.bookingService.updateBookingStatus(req.user.id, +id, status);
    this.gateway.notifyRideStatusUpdated(booking);
    return booking;
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmBooking(@Request() req, @Param('id') id: string) {
    const booking = await this.bookingService.completeBooking(req.user.id, +id);
    this.gateway.notifyRideStatusUpdated(booking);
    return booking;
  }
}
