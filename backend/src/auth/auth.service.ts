import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';
import * as tls from 'node:tls';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

type PasswordResetOtp = {
  userId: string;
  otpHash: string;
  expiresAt: number;
  verified: boolean;
};

const PASSWORD_RESET_OTP_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly passwordResetOtps = new Map<string, PasswordResetOtp>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private buildAuthResponse(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        role: user.role,
        trustScore: Number(user.trust_score),
        tripsCreated: user.tripsCreated,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.usersService.create({
        email: dto.email,
        password_hash,
        full_name: dto.fullName,
        role: UserRole.USER,
      });

      return this.buildAuthResponse(user);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Email đã được sử dụng');
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (user.is_banned) {
      throw new ForbiddenException('Tài khoản đã bị khóa');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    return this.buildAuthResponse(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password_hash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mật khẩu cũ không đúng');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(userId, passwordHash);

    return { message: 'Đổi mật khẩu thành công' };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Email không tồn tại trong hệ thống');
    }

    if (user.is_banned) {
      throw new ForbiddenException('Tài khoản đã bị khóa');
    }

    const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const otpHash = await bcrypt.hash(otp, 10);

    this.passwordResetOtps.set(email, {
      userId: user.id,
      otpHash,
      expiresAt: Date.now() + PASSWORD_RESET_OTP_TTL_MS,
      verified: false,
    });

    try {
      await this.sendPasswordResetOtp(email, otp);
    } catch (error) {
      this.passwordResetOtps.delete(email);
      throw new InternalServerErrorException(
        error instanceof Error
          ? `Không thể gửi OTP: ${error.message}`
          : 'Không thể gửi OTP',
      );
    }

    return { message: 'Mã OTP đã được gửi' };
  }

  async verifyResetOtp(dto: VerifyResetOtpDto) {
    const email = this.normalizeEmail(dto.email);
    const record = await this.getValidPasswordResetRecord(email, dto.otp);

    record.verified = true;
    this.passwordResetOtps.set(email, record);

    return { message: 'Xác thực OTP thành công' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = this.normalizeEmail(dto.email);
    const record = await this.getValidPasswordResetRecord(email, dto.otp);

    if (!record.verified) {
      throw new BadRequestException('Vui lòng xác thực OTP trước');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(record.userId, passwordHash);
    this.passwordResetOtps.delete(email);

    return { message: 'Đặt lại mật khẩu thành công' };
  }

  async validateJwtPayload(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);

    if (user.is_banned) {
      throw new ForbiddenException('Tài khoản đã bị khóa');
    }

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
    );
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private async getValidPasswordResetRecord(email: string, otp: string) {
    const record = this.passwordResetOtps.get(email);

    if (!record) {
      throw new BadRequestException('OTP không hợp lệ hoặc đã hết hạn');
    }

    if (Date.now() > record.expiresAt) {
      this.passwordResetOtps.delete(email);
      throw new BadRequestException('OTP đã hết hạn');
    }

    const isOtpValid = await bcrypt.compare(otp, record.otpHash);
    if (!isOtpValid) {
      throw new BadRequestException('OTP không đúng');
    }

    return record;
  }

  private async sendPasswordResetOtp(accountEmail: string, otp: string) {
    const smtpUser = this.config.get<string>('PASSWORD_RESET_SMTP_USER');
    const smtpPass = this.config.get<string>('PASSWORD_RESET_SMTP_PASS');
    const demoRecipient = this.config.get<string>(
      'PASSWORD_RESET_DEMO_RECIPIENT',
    );

    if (!smtpUser || !smtpPass || !demoRecipient) {
      throw new Error('Thiếu cấu hình SMTP trong .env');
    }

    const fromName = this.config.get<string>(
      'PASSWORD_RESET_FROM_NAME',
      'TripConnect',
    );
    const subject = 'TripConnect - Mã OTP đặt lại mật khẩu';
    const text = [
      `Tài khoản yêu cầu đặt lại mật khẩu: ${accountEmail}`,
      `Mã OTP của bạn là: ${otp}`,
      '',
      'Mã OTP có hiệu lực trong 10 phút.',
      'Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.',
    ].join('\n');

    await this.sendSmtpMail({
      host: this.config.get<string>('PASSWORD_RESET_SMTP_HOST', 'smtp.gmail.com'),
      port: Number(this.config.get<string>('PASSWORD_RESET_SMTP_PORT', '465')),
      user: smtpUser,
      pass: smtpPass,
      from: smtpUser,
      fromName,
      to: demoRecipient,
      subject,
      text,
    });
  }

  private sendSmtpMail(options: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    fromName: string;
    to: string;
    subject: string;
    text: string;
  }) {
    return new Promise<void>((resolve, reject) => {
      const socket = tls.connect(
        {
          host: options.host,
          port: options.port,
          servername: options.host,
        },
        () => undefined,
      );
      let buffer = '';
      const responseQueue: string[] = [];
      const waiters: Array<(line: string) => void> = [];

      const pushLine = (line: string) => {
        const waiter = waiters.shift();
        if (waiter) {
          waiter(line);
          return;
        }

        responseQueue.push(line);
      };

      socket.setEncoding('utf8');
      socket.on('data', (chunk) => {
        buffer += chunk;
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';
        lines.filter(Boolean).forEach(pushLine);
      });
      socket.on('error', reject);

      const nextLine = () =>
        new Promise<string>((lineResolve) => {
          const queuedLine = responseQueue.shift();
          if (queuedLine) {
            lineResolve(queuedLine);
            return;
          }

          waiters.push(lineResolve);
        });

      const readResponse = async () => {
        let line = await nextLine();
        const code = line.slice(0, 3);

        while (line.startsWith(`${code}-`)) {
          line = await nextLine();
        }

        return { code, line };
      };

      const expect = async (expectedCode: string) => {
        const response = await readResponse();
        if (response.code !== expectedCode) {
          throw new Error(response.line);
        }
      };

      const write = (command: string) => {
        socket.write(`${command}\r\n`);
      };

      const run = async () => {
        await expect('220');
        write('EHLO tripconnect.local');
        await expect('250');
        write('AUTH LOGIN');
        await expect('334');
        write(Buffer.from(options.user).toString('base64'));
        await expect('334');
        write(Buffer.from(options.pass).toString('base64'));
        await expect('235');
        write(`MAIL FROM:<${options.from}>`);
        await expect('250');
        write(`RCPT TO:<${options.to}>`);
        await expect('250');
        write('DATA');
        await expect('354');
        socket.write(`${this.buildMailData(options)}\r\n.\r\n`);
        await expect('250');
        write('QUIT');
        socket.end();
        resolve();
      };

      run().catch((error) => {
        socket.destroy();
        reject(error);
      });
    });
  }

  private buildMailData(options: {
    from: string;
    fromName: string;
    to: string;
    subject: string;
    text: string;
  }) {
    const encodedSubject = Buffer.from(options.subject, 'utf8').toString(
      'base64',
    );
    const safeText = options.text.replace(/\r?\n\./g, '\n..');

    return [
      `From: ${this.encodeMailHeader(options.fromName)} <${options.from}>`,
      `To: ${options.to}`,
      `Subject: =?UTF-8?B?${encodedSubject}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      safeText,
    ].join('\r\n');
  }

  private encodeMailHeader(value: string) {
    return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
  }
}
