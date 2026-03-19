import { Controller, Get } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../core/decorators/public.decorator';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Public() // Allow public access so forms can load it without token if needed, or require auth, but public is easier for form dropdowns.
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả Hãng xe và Dòng xe' })
  findAll() {
    return this.brandsService.findAll();
  }
}
