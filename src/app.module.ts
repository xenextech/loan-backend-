import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { StorageModule } from './modules/storage/storage.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminModule } from './modules/admin/admin.module';
import { UtilsModule } from './modules/utils/utils.module';
import { CreditScoreModule } from './modules/creditScore/credit-score.module';
import { ParentsModule } from './modules/parents/parents.module';
import { CollegeModule } from './modules/college/college.module';
import { ParentPublicModule } from './modules/parent-public/parent-public.module';
import { OfferLetterModule } from './modules/offer-letter/offer-letter.module';
import { AgreementModule } from './modules/agreement/agreement.module';
import { EnrollmentCertificateModule } from './modules/enrollment-certificate/enrollment-certificate.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ApplicationsModule,
    DocumentsModule,
    StorageModule,
    NotificationsModule,
    AuditModule,
    CreditScoreModule,
    AdminModule,
    UtilsModule,
    ParentsModule,
    CollegeModule,
    ParentPublicModule,
    OfferLetterModule,
    AgreementModule,
    EnrollmentCertificateModule,
  ],
})
export class AppModule {}
