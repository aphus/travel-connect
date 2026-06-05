import { IsEmail, MaxLength } from 'class-validator';

export class SendEmailOtpDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;
}
