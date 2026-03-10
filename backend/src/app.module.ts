import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { AuctionsModule } from './modules/auctions/auctions.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/passport/jwt-auth.guard';
import { RolesGuard } from './modules/auth/passport/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // load env
    PrismaModule,
    AuthModule,
    UsersModule,
    AddressesModule,
    CategoriesModule,
    ProductsModule,
    AuctionsModule,
    OrdersModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
