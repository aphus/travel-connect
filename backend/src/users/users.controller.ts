import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SendPhoneOtpDto } from './dto/send-phone-otp.dto';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';
import { SendEmailOtpDto } from './dto/send-email-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { SubmitIdentityVerificationDto } from './dto/submit-identity-verification.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyProfile(@CurrentUser() user: { sub: string }) {
    return this.usersService.getPrivateById(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMyProfile(
    @CurrentUser() user: { sub: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/email/send-otp')
  sendEmailOtp(
    @CurrentUser() user: { sub: string },
    @Body() dto: SendEmailOtpDto,
  ) {
    return this.usersService.sendEmailOtp(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/email/verify-otp')
  verifyEmailOtp(
    @CurrentUser() user: { sub: string },
    @Body() dto: VerifyEmailOtpDto,
  ) {
    return this.usersService.verifyEmailOtp(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/phone/send-otp')
  sendPhoneOtp(@Body() dto: SendPhoneOtpDto) {
    return this.usersService.sendPhoneOtp(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/phone/verify-otp')
  verifyPhoneOtp(
    @CurrentUser() user: { sub: string },
    @Body() dto: VerifyPhoneOtpDto,
  ) {
    return this.usersService.verifyPhoneOtp(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/identity-verification')
  submitIdentityVerification(
    @CurrentUser() user: { sub: string },
    @Body() dto: SubmitIdentityVerificationDto,
  ) {
    return this.usersService.submitIdentityVerification(user.sub, dto);
  }

  @Public()
  @Get('top/leaders')
  getTopLeaders() {
    return this.usersService.getTopTrustedLeaders(5);
  }

  @Get(':id')
  getUserProfile(@Param('id') id: string) {
    return this.usersService.getPublicById(id);
  }

}
