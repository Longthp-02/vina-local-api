import { Type } from "class-transformer";
import {
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateVendorDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  addressText!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  district!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  city!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  category!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMax?: number;

  @IsOptional()
  @IsObject()
  openHoursJson?: Record<string, unknown>;
}
