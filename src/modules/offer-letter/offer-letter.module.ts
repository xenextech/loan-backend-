import { Module } from '@nestjs/common';
import { OfferLetterController } from './offer-letter.controller';
import { OfferLetterService } from './offer-letter.service';

@Module({
  controllers: [OfferLetterController],
  providers: [OfferLetterService],
})
export class OfferLetterModule {}
