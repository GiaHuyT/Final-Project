import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReportsModule } from './modules/reports/reports.module';
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
import { ChatModule } from './modules/chat/chat.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CartModule } from './modules/cart/cart.module';
import { PayosModule } from './modules/payos/payos.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/passport/jwt-auth.guard';
import { RolesGuard } from './modules/auth/passport/roles.guard';

import { TransactionsModule } from './modules/transactions/transactions.module';
import { AiModule } from './modules/ai/ai.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { DriverRentalModule } from './modules/driver-rental/driver-rental.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // load env
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // Mặc định cache 60 giây (1 phút)
      max: 100,   // Số lượng item tối đa trong cache
    }),
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
    ChatModule,
    ReviewsModule,
    CartModule,
    PayosModule,
    TransactionsModule,
    ReportsModule,
    AiModule,
    ContactsModule,
    MaintenanceModule,
    DriverRentalModule,
    CloudinaryModule,
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
