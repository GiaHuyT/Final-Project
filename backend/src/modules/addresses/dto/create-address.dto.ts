import { IsBoolean, IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
    @ApiProperty({ example: 'Nhà riêng' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Nguyễn Văn A' })
    @IsString()
    @IsNotEmpty()
    receiverName: string;

    @ApiProperty({ example: '0912345678' })
    @IsString()
    @IsNotEmpty()
    receiverPhone: string;

    @ApiProperty({ example: 'Số 123 Đường ABC' })
    @IsString()
    @IsNotEmpty()
    detail: string;

    @ApiProperty({ example: 'TP. Hồ Chí Minh' })
    @IsString()
    @IsNotEmpty()
    province: string;

    @ApiProperty({ example: 'Quận 1' })
    @IsString()
    @IsNotEmpty()
    district: string;

    @ApiProperty({ example: 'Phường Bến Nghé' })
    @IsString()
    @IsNotEmpty()
    ward: string;

    @ApiProperty({ example: 10.7769 })
    @IsNumber()
    @IsOptional()
    latitude?: number;

    @ApiProperty({ example: 106.7009 })
    @IsNumber()
    @IsOptional()
    longitude?: number;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
