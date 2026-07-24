import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardDisbursementService } from './dashboard-disbursement.service';
import {
  CreateDisbursementConditionDto,
  UpdateDisbursementConditionDto,
} from '../dto/disbursement-condition.dto';
import { ConfirmDisbursementDto } from '../dto/confirm-disbursement.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../../common/enums';
import { DASHBOARD_STAFF_ROLES } from '../dashboard-roles.constant';

@ApiTags('Dashboard: Disbursement')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...DASHBOARD_STAFF_ROLES)
@Controller('dashboard/disbursement')
export class DashboardDisbursementController {
  constructor(
    private readonly dashboardDisbursementService: DashboardDisbursementService,
  ) {}

  @Get('pending')
  @ApiOperation({ summary: 'List approved applications pending disbursement' })
  getPending(@Query() query: PaginationDto) {
    return this.dashboardDisbursementService.getPending(query);
  }

  @Get(':applicationId/conditions')
  @ApiOperation({
    summary: 'Get disbursement conditions checklist for an application',
  })
  getConditions(@Param('applicationId') applicationId: string) {
    return this.dashboardDisbursementService.getConditions(applicationId);
  }

  @Post(':applicationId/conditions')
  @Roles(UserRole.CREDIT_MANAGER)
  @ApiOperation({
    summary:
      'Add a disbursement condition. Credit Manager only — the Credit Manager owns disbursement readiness end-to-end (conditions, tranche confirmation) as of the legal-document-gated workflow.',
  })
  addCondition(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: CreateDisbursementConditionDto,
  ) {
    return this.dashboardDisbursementService.addCondition(
      user.sub,
      applicationId,
      dto,
    );
  }

  @Patch(':applicationId/conditions/:conditionId')
  @Roles(UserRole.CREDIT_MANAGER)
  @ApiOperation({ summary: 'Update a disbursement condition status. Credit Manager only.' })
  updateCondition(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Param('conditionId') conditionId: string,
    @Body() dto: UpdateDisbursementConditionDto,
  ) {
    return this.dashboardDisbursementService.updateCondition(
      user.sub,
      applicationId,
      conditionId,
      dto,
    );
  }

  @Post(':applicationId/confirm')
  @Roles(UserRole.CREDIT_MANAGER)
  @ApiOperation({
    summary:
      'Confirm a disbursement tranche for an application. Credit Manager only — the Approver no longer determines or confirms the disbursement amount. Requires the parent bank account to be set up and a SIGNED (or ACTIVE) Loan Agreement legal document to exist — returns 400 with a validation message otherwise.',
  })
  confirm(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: ConfirmDisbursementDto,
  ) {
    return this.dashboardDisbursementService.confirm(
      user.sub,
      applicationId,
      dto,
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Disbursement tranche history (paginated)' })
  getHistory(@Query() query: PaginationDto) {
    return this.dashboardDisbursementService.getHistory(query);
  }
}
