import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class CreateReviewDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  userId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @MaxLength(2000)
  content!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  cleanlinessScore!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  authenticityScore!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  valueScore!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  crowdScore!: number;
}
