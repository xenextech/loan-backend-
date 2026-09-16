import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { NEPAL_PHONE_INPUT_REGEX } from '../utils/phone-number.util';

export class MobileRegisterDto {
  @ApiProperty({ example: 'Ram' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  lastName: string;

  @ApiProperty({ example: '9812345678' })
  @Matches(NEPAL_PHONE_INPUT_REGEX, {
    message: 'Enter a valid Nepali mobile number',
  })
  phoneNumber: string;

  // Temporary requirement — OTPs (phone verification + password reset) are
  // currently emailed via existing SMTP instead of sent by SMS (see
  // MobileOtpService). Not used for login; phoneNumber + password remain
  // the only credentials.
  @ApiProperty({ example: 'ram.sharma@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;
}
