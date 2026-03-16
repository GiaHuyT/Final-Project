import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { RentalCarsController } from './rental-cars.controller';
import { RentalCarsService } from './rental-cars.service';

@Module({
    imports: [PrismaModule],
    controllers: [RentalCarsController],
    providers: [RentalCarsService],
})
export class RentalCarsModule { }
