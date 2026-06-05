import { IsString, IsUrl, MaxLength } from 'class-validator';

export class SubmitIdentityVerificationDto {
  @IsString()
  @IsUrl({ require_tld: false })
  @MaxLength(1000)
  document_url!: string;

  @IsString()
  @MaxLength(255)
  document_public_id!: string;
}
