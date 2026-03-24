import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { Public } from '../../core/decorators/public.decorator';

import { CategoriesService } from './categories.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Lấy tất cả danh mục' })

    findAll() {
        return this.categoriesService.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Tạo danh mục mới' })
    create(@Body('name') name: string) {
        return this.categoriesService.create(name);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa danh mục' })
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(+id);
    }
}
