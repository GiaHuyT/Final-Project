import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRentalCarDto {
    @ApiProperty() @IsString() name: string;
    @ApiProperty() @IsString() type: string;
    @ApiProperty() @IsString() plate: string;
    @ApiProperty() @IsNumber() price: number;
    @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() imageUrl?: string;
}
