import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UsersController } from './users.controller';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
