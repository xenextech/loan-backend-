import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
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
import { ApplicationInitiatorModule } from './modules/applicationInitiator/application-initiator.module';
import { ParentsModule } from './modules/parents/parents.module';
import { CollegeModule } from './modules/college/college.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { ParentPublicModule } from './modules/parent-public/parent-public.module';
import { OfferLetterModule } from './modules/offer-letter/offer-letter.module';
import { AgreementModule } from './modules/agreement/agreement.module';
import { EnrollmentCertificateModule } from './modules/enrollment-certificate/enrollment-certificate.module';
import { DocumentVaultModule } from './modules/document-vault/document-vault.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DashboardJobsModule } from './modules/dashboard/jobs/dashboard-jobs.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { BankAccountOpeningModule } from './modules/bank-account/bank-account-opening.module';
import { AppThrottlerGuard } from './common/guards/app-throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    // Named policies, all env-driven via configuration.ts. Every request is
    // billed against exactly one of them — AppThrottlerGuard picks which, so
    // an auth attempt never draws down the caller's normal API budget.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        { name: 'global', ...config.getOrThrow('throttle.global') },
        { name: 'auth', ...config.getOrThrow('throttle.auth') },
        { name: 'sensitive', ...config.getOrThrow('throttle.sensitive') },
      ],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ApplicationsModule,
    DocumentsModule,
    StorageModule,
    NotificationsModule,
    AuditModule,
    CreditScoreModule,
    ApplicationInitiatorModule,
    AdminModule,
    UtilsModule,
    ParentsModule,
    CollegeModule,
    MarketplaceModule,
    ParentPublicModule,
    OfferLetterModule,
    AgreementModule,
    EnrollmentCertificateModule,
    DocumentVaultModule,
    DashboardModule,
    DashboardJobsModule,
    PermissionsModule,
    BankAccountOpeningModule,
  ],
  providers: [
    // Global so throttling runs ahead of JwtAuthGuard and floods are rejected
    // before any bcrypt or database work happens.
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
  ],
})
export class AppModule {}
