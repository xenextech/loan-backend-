import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CreditScoreModule } from '../creditScore/credit-score.module';
import { UtilsModule } from '../utils/utils.module';

import { DashboardOverviewController } from './overview/dashboard-overview.controller';
import { DashboardOverviewService } from './overview/dashboard-overview.service';
import { DashboardApplicationsController } from './applications/dashboard-applications.controller';
import { DashboardApplicationsService } from './applications/dashboard-applications.service';
import { DashboardApprovalController } from './approval/dashboard-approval.controller';
import { DashboardApprovalService } from './approval/dashboard-approval.service';
import { DashboardDisbursementController } from './disbursement/dashboard-disbursement.controller';
import { DashboardDisbursementService } from './disbursement/dashboard-disbursement.service';
import { DashboardRepaymentController } from './repayment/dashboard-repayment.controller';
import { DashboardRepaymentService } from './repayment/dashboard-repayment.service';
import { DashboardNotificationsController } from './notifications/dashboard-notifications.controller';
import { DashboardNotificationsService } from './notifications/dashboard-notifications.service';
import { DashboardDocumentsController } from './documents/dashboard-documents.controller';
import { DashboardDocumentsService } from './documents/dashboard-documents.service';
import { DashboardInsuranceController } from './insurance/dashboard-insurance.controller';
import { DashboardInsuranceService } from './insurance/dashboard-insurance.service';
import { DashboardCommissionController } from './commission/dashboard-commission.controller';
import { DashboardCommissionService } from './commission/dashboard-commission.service';
import { DashboardAuditController } from './audit/dashboard-audit.controller';
import { DashboardAuditService } from './audit/dashboard-audit.service';

@Module({
  imports: [AuditModule, CreditScoreModule, UtilsModule],
  controllers: [
    DashboardOverviewController,
    DashboardApplicationsController,
    DashboardApprovalController,
    DashboardDisbursementController,
    DashboardRepaymentController,
    DashboardNotificationsController,
    DashboardDocumentsController,
    DashboardInsuranceController,
    DashboardCommissionController,
    DashboardAuditController,
  ],
  providers: [
    DashboardOverviewService,
    DashboardApplicationsService,
    DashboardApprovalService,
    DashboardDisbursementService,
    DashboardRepaymentService,
    DashboardNotificationsService,
    DashboardDocumentsService,
    DashboardInsuranceService,
    DashboardCommissionService,
    DashboardAuditService,
  ],
})
export class DashboardModule {}
