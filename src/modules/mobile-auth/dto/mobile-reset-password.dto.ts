import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { NEPAL_PHONE_INPUT_REGEX } from '../utils/phone-number.util';

export class MobileResetPasswordDto {
  @ApiProperty({ example: '9812345678' })
  @Matches(NEPAL_PHONE_INPUT_REGEX, {
    message: 'Enter a valid Nepali mobile number',
  })
  phoneNumber: string;

  @ApiProperty({ example: '123456' })
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code: string;

  @ApiProperty({ example: 'NewPassword@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;
}
