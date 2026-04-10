import { IsNotEmpty, IsNumber, IsString, IsArray, IsOptional } from 'class-validator';

export class CreatePaymentLinkDto {
  @IsNotEmpty()
  @IsNumber()
  orderCode: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;

  @IsOptional()
  @IsString()
  returnUrl?: string;

  @IsOptional()
  @IsArray()
  items?: any[];
}
