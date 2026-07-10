import { Module } from '@nestjs/common';
import { OfferLetterController } from './offer-letter.controller';
import { OfferLetterService } from './offer-letter.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [OfferLetterController],
  providers: [OfferLetterService],
})
export class OfferLetterModule {}
