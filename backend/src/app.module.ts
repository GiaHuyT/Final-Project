import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AddressesModule } from './modules/addresses/addresses.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // load env
    PrismaModule,
    AuthModule,
    UsersModule,
    AddressesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
