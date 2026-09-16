import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { NEPAL_PHONE_INPUT_REGEX } from '../utils/phone-number.util';

export class MobileVerifyOtpDto {
  @ApiProperty({ example: '9812345678' })
  @Matches(NEPAL_PHONE_INPUT_REGEX, {
    message: 'Enter a valid Nepali mobile number',
  })
  phoneNumber: string;

  @ApiProperty({ example: '123456' })
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code: string;
}
