import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './modules/users/users.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { AuctionsModule } from './modules/auctions/auctions.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { RentalCarsModule } from './modules/rental-cars/rental-cars.module';
import { RepairsModule } from './modules/repairs/repairs.module';
import { BrandsModule } from './modules/brands/brands.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/passport/jwt-auth.guard';
import { RolesGuard } from './modules/auth/passport/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // load env
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    AddressesModule,
    CategoriesModule,
    ProductsModule,
    AuctionsModule,
    OrdersModule,
    DashboardModule,
    RentalCarsModule,
    RepairsModule,
    BrandsModule,
    FavoritesModule,
    NotificationsModule,
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
