import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectIdentityVerificationDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
