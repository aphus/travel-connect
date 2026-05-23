import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  destination: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  budget?: number;

  @IsInt()
  @Min(1)
  @Max(100)
  max_members: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
