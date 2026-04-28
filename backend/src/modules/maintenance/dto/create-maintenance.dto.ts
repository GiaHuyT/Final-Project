import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateMaintenanceDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên dịch vụ không được để trống' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
