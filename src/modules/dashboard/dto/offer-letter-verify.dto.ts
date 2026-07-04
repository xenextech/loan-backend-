import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyOfferLetterDto {
  @ApiProperty({
    description: 'Loan application to attach the verification to',
  })
  @IsString()
  applicationId: string;

  @ApiProperty({
    description: 'Offer letter reference number or QR token',
    example: 'AIM/OFFER/2081-082/0041',
  })
  @IsString()
  refOrQrToken: string;
}
