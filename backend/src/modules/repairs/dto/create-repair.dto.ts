import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRepairDto {
    @ApiProperty() @IsString() name: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
    @ApiProperty() @IsNumber() price: number;
    @ApiProperty({ required: false }) @IsOptional() @IsString() imageUrl?: string;
}
