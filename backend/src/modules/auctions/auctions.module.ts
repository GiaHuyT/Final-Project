import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsCronService } from './auctions-cron.service';
import { AuctionsController } from './auctions.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
    imports: [PrismaModule, TransactionsModule],
    controllers: [AuctionsController],
    providers: [AuctionsService, AuctionsCronService],
    exports: [AuctionsService],
})
export class AuctionsModule { }

