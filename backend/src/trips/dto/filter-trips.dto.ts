import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TripStatus } from '../entities/trip.entity';

export class FilterTripsDto {
  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  min_budget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  max_budget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  min_members?: number;

  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;
}
