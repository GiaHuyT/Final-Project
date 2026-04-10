import { Module, Global, forwardRef } from '@nestjs/common';
import { PayOS } from "@payos/node";
import { ConfigService } from '@nestjs/config';
import { PayosService } from './payos.service';
import { PayosController } from './payos.controller';
import { TransactionsModule } from '../transactions/transactions.module';

@Global()
@Module({
  imports: [forwardRef(() => TransactionsModule)],
  controllers: [PayosController],
  providers: [
    PayosService,
    {
      provide: 'PAYOS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new PayOS(
          {
            clientId: configService.get<string>('CLIENT_ID'),
            apiKey: configService.get<string>('API_KEY'),
            checksumKey: configService.get<string>('CHECKSUM_KEY')
          }
        );
      },
      inject: [ConfigService],
    },
  ],
  exports: ['PAYOS_CLIENT', PayosService],
})
export class PayosModule {}
