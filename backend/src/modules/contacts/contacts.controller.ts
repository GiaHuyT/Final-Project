import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { Public } from '../../core/decorators/public.decorator';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Public()
  @Post()
  create(@Body() createContactDto: any) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  findAll() {
    return this.contactsService.findAll();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.contactsService.updateStatus(+id, status);
  }
}
