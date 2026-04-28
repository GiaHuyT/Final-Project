import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  pickupAddress: string;

  @IsNumber()
  @IsNotEmpty()
  pickupLat: number;

  @IsNumber()
  @IsNotEmpty()
  pickupLng: number;

  @IsString()
  @IsNotEmpty()
  dropoffAddress: string;

  @IsNumber()
  @IsNotEmpty()
  dropoffLat: number;

  @IsNumber()
  @IsNotEmpty()
  dropoffLng: number;

  @IsNumber()
  @IsNotEmpty()
  distanceKm: number;

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @IsString()
  @IsOptional()
  carType?: string;

  @IsString()
  @IsOptional()
  carBrand?: string;

  @IsString()
  @IsOptional()
  transmission?: string;

  @IsString()
  @IsOptional()
  licensePlate?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  requiredLicense?: string;
}
