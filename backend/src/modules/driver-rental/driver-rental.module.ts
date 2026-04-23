import { Module } from '@nestjs/common';
import { DriverRentalService } from './driver-rental.service';
import { DriverRentalController } from './driver-rental.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DriverRentalController],
  providers: [DriverRentalService],
})
export class DriverRentalModule {}
