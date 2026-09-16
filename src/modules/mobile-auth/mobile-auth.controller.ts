import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MobileAuthService } from './mobile-auth.service';
import { MobileRegisterDto } from './dto/mobile-register.dto';
import { MobileLoginDto } from './dto/mobile-login.dto';
import { MobileVerifyOtpDto } from './dto/mobile-verify-otp.dto';
import { MobileResendOtpDto } from './dto/mobile-resend-otp.dto';
import { MobileForgotPasswordDto } from './dto/mobile-forgot-password.dto';
import { MobileResetPasswordDto } from './dto/mobile-reset-password.dto';
import { MobileJwtAuthGuard } from './guards/mobile-jwt-auth.guard';
import { MobileCurrentUser } from './decorators/mobile-current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import {
  AuthThrottle,
  SensitiveThrottle,
} from '../../common/decorators/throttle-policy.decorator';
import { MobileJwtPayload } from './interfaces/mobile-jwt-payload.interface';

@ApiTags('Mobile Auth')
@UseGuards(MobileJwtAuthGuard)
@Controller('mobile-auth')
export class MobileAuthController {
  constructor(private readonly mobileAuthService: MobileAuthService) {}

  @Public()
  @AuthThrottle()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new mobile app account (phone + password)',
  })
  register(@Body() dto: MobileRegisterDto) {
    return this.mobileAuthService.register(dto);
  }

  @Public()
  @SensitiveThrottle()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend the phone verification SMS code' })
  resendOtp(@Body() dto: MobileResendOtpDto) {
    return this.mobileAuthService.resendOtp(dto);
  }

  @Public()
  @AuthThrottle()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify phone number with the SMS code and receive a JWT',
  })
  verifyOtp(@Body() dto: MobileVerifyOtpDto) {
    return this.mobileAuthService.verifyOtp(dto);
  }

  @Public()
  @AuthThrottle()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with phone number + password, receive a JWT',
  })
  login(@Body() dto: MobileLoginDto) {
    return this.mobileAuthService.login(dto);
  }

  @Public()
  @SensitiveThrottle()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password-reset SMS code' })
  forgotPassword(@Body() dto: MobileForgotPasswordDto) {
    return this.mobileAuthService.forgotPassword(dto);
  }

  @Public()
  @AuthThrottle()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using the SMS code' })
  resetPassword(@Body() dto: MobileResetPasswordDto) {
    return this.mobileAuthService.resetPassword(dto);
  }

  @Get('me')
  @ApiBearerAuth('MobileJWT')
  @ApiOperation({ summary: 'Get current authenticated mobile user profile' })
  getProfile(@MobileCurrentUser() user: MobileJwtPayload) {
    return this.mobileAuthService.getProfile(user.sub);
  }
}
