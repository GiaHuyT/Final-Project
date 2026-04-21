import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { PrismaService } from '../../../prisma/prisma.service'; // Assuming relative path since it's commonly in root or prisma folder
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ContactsController],
  providers: [ContactsService, PrismaService],
})
export class ContactsModule {}
