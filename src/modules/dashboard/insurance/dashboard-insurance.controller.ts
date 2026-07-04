import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardInsuranceService } from './dashboard-insurance.service';
import { InsurancePolicyQueryDto } from '../dto/insurance-policy-query.dto';
import { CreateInsurancePolicyDto } from '../dto/create-insurance-policy.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { DASHBOARD_STAFF_ROLES } from '../dashboard-roles.constant';

@ApiTags('Dashboard: Insurance Tracker')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...DASHBOARD_STAFF_ROLES)
@Controller('dashboard/insurance')
export class DashboardInsuranceController {
  constructor(
    private readonly dashboardInsuranceService: DashboardInsuranceService,
  ) {}

  @Get('stats')
  @ApiOperation({
    summary:
      'Insurance aggregate stats — active, expiring in 30 days, expired, sum-insured-to-loan ratio',
  })
  getStats() {
    return this.dashboardInsuranceService.getStats();
  }

  @Get('policies')
  @ApiOperation({ summary: 'List insurance policies (paginated)' })
  list(@Query() query: InsurancePolicyQueryDto) {
    return this.dashboardInsuranceService.list(query);
  }

  @Post('policies')
  @ApiOperation({ summary: 'Add an insurance policy for an application' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateInsurancePolicyDto,
  ) {
    return this.dashboardInsuranceService.create(user.sub, dto);
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Get a single insurance policy' })
  getOne(@Param('id') id: string) {
    return this.dashboardInsuranceService.getOne(id);
  }
}
