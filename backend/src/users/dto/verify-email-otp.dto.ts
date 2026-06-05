import { IsEmail, IsString, MaxLength } from 'class-validator';

export class VerifyEmailOtpDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(12)
  code!: string;
}
