import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { NEPAL_PHONE_INPUT_REGEX } from '../utils/phone-number.util';

export class MobileForgotPasswordDto {
  @ApiProperty({ example: '9812345678' })
  @Matches(NEPAL_PHONE_INPUT_REGEX, {
    message: 'Enter a valid Nepali mobile number',
  })
  phoneNumber: string;
}
