import { IsString, MaxLength } from 'class-validator';

export class VerifyPhoneOtpDto {
  @IsString()
  @MaxLength(30)
  phone_number!: string;

  @IsString()
  @MaxLength(12)
  code!: string;
}
