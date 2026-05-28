import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  destination: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budget?: number;

  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(100)
  maxMembers: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
