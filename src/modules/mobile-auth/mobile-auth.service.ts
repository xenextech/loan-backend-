import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MobileOtpPurpose, UserRole, type User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MobileOtpService } from './mobile-otp.service';
import { normalizePhoneNumber } from './utils/phone-number.util';
import { MobileRegisterDto } from './dto/mobile-register.dto';
import { MobileLoginDto } from './dto/mobile-login.dto';
import { MobileVerifyOtpDto } from './dto/mobile-verify-otp.dto';
import { MobileResendOtpDto } from './dto/mobile-resend-otp.dto';
import { MobileForgotPasswordDto } from './dto/mobile-forgot-password.dto';
import { MobileResetPasswordDto } from './dto/mobile-reset-password.dto';
import { MobileJwtPayload } from './interfaces/mobile-jwt-payload.interface';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class MobileAuthService {
  // Signs the *primary* web/staff-style JWT (JwtStrategy, `users` table) —
  // deliberately NOT wired through Nest DI (that would collide with the
  // mobile JwtService injected below, both typed JwtService). Constructed
  // by hand with the same secret/expiry AuthModule's own JwtModule uses, so
  // a token from here validates identically for every /applications,
  // /dashboard, etc. endpoint gated by JwtAuthGuard.
  private readonly webJwt: JwtService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly otp: MobileOtpService,
    private readonly config: ConfigService,
  ) {
    this.webJwt = new JwtService({
      secret: this.config.get<string>('jwt.secret'),
      signOptions: { expiresIn: this.config.get('jwt.expiresIn') ?? '7d' },
    });
  }

  private sign(user: { id: string; phoneNumber: string }): string {
    const payload: MobileJwtPayload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
    };
    // Mobile tokens use their own secret/expiry (mobileJwt.*) — see
    // MobileAuthModule's JwtModule.registerAsync, distinct from the web
    // AuthModule's JwtModule instance.
    return this.jwt.sign(payload);
  }

  private signWeb(user: Pick<User, 'id' | 'email' | 'role'>): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.webJwt.sign(payload);
  }

  private toProfile(user: {
    id: string;
    phoneNumber: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    isPhoneVerified: boolean;
  }) {
    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      isPhoneVerified: user.isPhoneVerified,
    };
  }

  private toWebUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  /**
   * Finds or creates the `User` row this phone account is bridged to, so a
   * phone-authenticated session can also carry a real web-style JWT — the
   * only thing that actually authenticates against /applications,
   * /dashboard, etc. Reused by email when a matching `User` already exists
   * (e.g. this person also registered via the web) rather than creating a
   * duplicate identity; completing OTP verification already proves control
   * of that email address, so linking on email match here is safe.
   */
  private async getOrCreateLinkedUser(mobileUser: {
    id: string;
    linkedUserId: string | null;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
  }): Promise<User> {
    if (mobileUser.linkedUserId) {
      const existing = await this.prisma.user.findUnique({
        where: { id: mobileUser.linkedUserId },
      });
      if (existing) return existing;
    }

    let user = await this.prisma.user.findUnique({
      where: { email: mobileUser.email },
    });

    if (!user) {
      // Never used to log in directly (this account only ever authenticates
      // via /mobile-auth/login) — a random, unrecoverable hash just
      // satisfies the required column. If this user ever wants password-based
      // email login too, they'd go through the normal forgot-password flow.
      const passwordHash = await bcrypt.hash(
        randomBytes(32).toString('hex'),
        12,
      );
      user = await this.prisma.user.create({
        data: {
          email: mobileUser.email,
          firstName: mobileUser.firstName,
          lastName: mobileUser.lastName,
          fullName: mobileUser.fullName,
          passwordHash,
          role: UserRole.STUDENT,
          // Already proven by completing OTP verification to this address.
          isEmailVerified: true,
        },
      });
    }

    await this.prisma.mobileUser.update({
      where: { id: mobileUser.id },
      data: { linkedUserId: user.id },
    });

    return user;
  }

  // ── Register ───────────────────────────────────────────────────────────────
  async register(dto: MobileRegisterDto) {
    const phoneNumber = normalizePhoneNumber(dto.phoneNumber);
    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.mobileUser.findFirst({
      where: { OR: [{ phoneNumber }, { email }] },
    });
    if (existing) {
      throw new ConflictException(
        existing.phoneNumber === phoneNumber
          ? 'Phone number already registered'
          : 'Email already registered',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const firstName = dto.firstName.trim();
    const lastName = dto.lastName.trim();

    const user = await this.prisma.mobileUser.create({
      data: {
        phoneNumber,
        email,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        passwordHash,
      },
    });

    await this.otp.issue(
      user.id,
      phoneNumber,
      email,
      MobileOtpPurpose.REGISTRATION,
    );

    return {
      message: 'Registration successful. Please verify your phone number.',
    };
  }

  // ── Verify OTP (registration) ─────────────────────────────────────────────
  // Auto-logs the user in on success — asking them to re-enter their
  // password immediately after they just typed a code is unnecessary
  // friction on mobile. Also bridges to a real User account (see
  // getOrCreateLinkedUser) and returns a web-style token alongside the
  // mobile one, so the client can drop straight into the full Student portal.
  async verifyOtp(dto: MobileVerifyOtpDto) {
    const phoneNumber = normalizePhoneNumber(dto.phoneNumber);
    const user = await this.prisma.mobileUser.findUnique({
      where: { phoneNumber },
    });
    if (!user) throw new NotFoundException('Account not found');

    await this.otp.verify(user.id, dto.code, MobileOtpPurpose.REGISTRATION);

    const verified = await this.prisma.mobileUser.update({
      where: { id: user.id },
      data: { isPhoneVerified: true },
    });

    const webUser = await this.getOrCreateLinkedUser(verified);

    return {
      accessToken: this.sign(verified),
      user: this.toProfile(verified),
      webAccessToken: this.signWeb(webUser),
      webUser: this.toWebUser(webUser),
    };
  }

  // ── Resend OTP (registration) ─────────────────────────────────────────────
  async resendOtp(dto: MobileResendOtpDto) {
    const phoneNumber = normalizePhoneNumber(dto.phoneNumber);
    const user = await this.prisma.mobileUser.findUnique({
      where: { phoneNumber },
    });
    if (!user) throw new NotFoundException('Account not found');
    if (user.isPhoneVerified) {
      throw new ConflictException('Phone number is already verified');
    }

    await this.otp.issue(
      user.id,
      phoneNumber,
      user.email,
      MobileOtpPurpose.REGISTRATION,
    );
    return { message: 'Verification code sent.' };
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  async login(dto: MobileLoginDto) {
    const phoneNumber = normalizePhoneNumber(dto.phoneNumber);
    const user = await this.prisma.mobileUser.findUnique({
      where: { phoneNumber },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    if (!user.isPhoneVerified) {
      throw new UnauthorizedException(
        'Please verify your phone number before logging in',
      );
    }

    const webUser = await this.getOrCreateLinkedUser(user);

    return {
      accessToken: this.sign(user),
      user: this.toProfile(user),
      webAccessToken: this.signWeb(webUser),
      webUser: this.toWebUser(webUser),
    };
  }

  // ── Forgot Password ────────────────────────────────────────────────────────
  // Always returns the same generic message regardless of whether the phone
  // number is registered, mirroring the web AuthService's email flow — this
  // prevents an attacker from using the endpoint to enumerate real accounts.
  async forgotPassword(dto: MobileForgotPasswordDto) {
    const phoneNumber = normalizePhoneNumber(dto.phoneNumber);
    const user = await this.prisma.mobileUser.findUnique({
      where: { phoneNumber },
    });

    if (user) {
      await this.otp.issue(
        user.id,
        phoneNumber,
        user.email,
        MobileOtpPurpose.PASSWORD_RESET,
      );
    }

    return {
      message: 'If that number is registered, a reset code has been sent.',
    };
  }

  // ── Reset Password ─────────────────────────────────────────────────────────
  async resetPassword(dto: MobileResetPasswordDto) {
    const phoneNumber = normalizePhoneNumber(dto.phoneNumber);
    const user = await this.prisma.mobileUser.findUnique({
      where: { phoneNumber },
    });
    if (!user) throw new NotFoundException('Account not found');

    await this.otp.verify(user.id, dto.code, MobileOtpPurpose.PASSWORD_RESET);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.mobileUser.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: 'Password reset successful. You can now log in.' };
  }

  // ── Get Profile ────────────────────────────────────────────────────────────
  async getProfile(mobileUserId: string) {
    const user = await this.prisma.mobileUser.findUnique({
      where: { id: mobileUserId },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.toProfile(user);
  }
}
