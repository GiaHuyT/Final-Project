import { Module } from '@nestjs/common';
import { DriverBookingService } from './driver-booking.service';
import { DriverBookingController } from './driver-booking.controller';
import { DriverBookingGateway } from './driver-booking.gateway';

@Module({
  controllers: [DriverBookingController],
  providers: [DriverBookingService, DriverBookingGateway],
  exports: [DriverBookingService],
})
export class DriverBookingModule {}
