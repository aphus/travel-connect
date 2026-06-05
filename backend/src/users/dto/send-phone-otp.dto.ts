import { IsString, MaxLength } from 'class-validator';

export class SendPhoneOtpDto {
  @IsString()
  @MaxLength(30)
  phone_number!: string;
}
