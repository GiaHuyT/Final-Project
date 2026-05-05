import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDate, ValidateNested, IsArray, Min } from 'class-validator';

export enum AuctionType {
  OFFLINE = 'OFFLINE',
  LIVESTREAM = 'LIVESTREAM',
}

export class AuctionItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  startPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  bidStep?: number;

  @IsString()
  @IsOptional()
  itemDescription?: string;
}

export class CreateAuctionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  startPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  bidStep?: number;

  @IsEnum(AuctionType)
  @IsOptional()
  type?: AuctionType;

  @IsString()
  @IsOptional()
  streamUrl?: string;

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuctionItemDto)
  items: AuctionItemDto[];
}
