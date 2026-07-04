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
import { DashboardCommissionService } from './dashboard-commission.service';
import {
  CreateCommissionPartnerDto,
  UpdateCommissionPartnerDto,
  CommissionPartnerQueryDto,
  CreateCommissionEntryDto,
  UpdateCommissionEntryDto,
  CommissionEntryQueryDto,
} from '../dto/commission.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { DASHBOARD_STAFF_ROLES } from '../dashboard-roles.constant';

@ApiTags('Dashboard: Commission')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...DASHBOARD_STAFF_ROLES)
@Controller('dashboard/commission')
export class DashboardCommissionController {
  constructor(
    private readonly dashboardCommissionService: DashboardCommissionService,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary:
      'Commission summary — total earned this year, from banks, from colleges, pending',
  })
  getSummary() {
    return this.dashboardCommissionService.getSummary();
  }

  @Get('by-bank')
  @ApiOperation({ summary: 'Commission breakdown by bank (paginated)' })
  getByBank(@Query() query: PaginationDto) {
    return this.dashboardCommissionService.getByBank(query);
  }

  @Get('by-college')
  @ApiOperation({ summary: 'Commission breakdown by college (paginated)' })
  getByCollege(@Query() query: PaginationDto) {
    return this.dashboardCommissionService.getByCollege(query);
  }

  @Get('nrb-cap-compliance')
  @ApiOperation({
    summary: 'Per-borrower NRB digital lending cap utilization (paginated)',
  })
  getNrbCapCompliance(@Query() query: PaginationDto) {
    return this.dashboardCommissionService.getNrbCapCompliance(query);
  }

  @Get('partners')
  @ApiOperation({
    summary: 'List commission partners (banks/colleges), paginated',
  })
  listPartners(@Query() query: CommissionPartnerQueryDto) {
    return this.dashboardCommissionService.listPartners(query);
  }

  @Post('partners')
  @ApiOperation({
    summary: 'Create a commission partner (bank or college MOU)',
  })
  createPartner(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCommissionPartnerDto,
  ) {
    return this.dashboardCommissionService.createPartner(user.sub, dto);
  }

  @Patch('partners/:id')
  @ApiOperation({ summary: 'Update a commission partner' })
  updatePartner(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCommissionPartnerDto,
  ) {
    return this.dashboardCommissionService.updatePartner(user.sub, id, dto);
  }

  @Get('entries')
  @ApiOperation({ summary: 'List commission ledger entries (paginated)' })
  listEntries(@Query() query: CommissionEntryQueryDto) {
    return this.dashboardCommissionService.listEntries(query);
  }

  @Post('entries')
  @ApiOperation({ summary: 'Create a commission ledger entry' })
  createEntry(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCommissionEntryDto,
  ) {
    return this.dashboardCommissionService.createEntry(user.sub, dto);
  }

  @Patch('entries/:id')
  @ApiOperation({
    summary: 'Update a commission ledger entry (e.g. mark paid)',
  })
  updateEntry(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCommissionEntryDto,
  ) {
    return this.dashboardCommissionService.updateEntry(user.sub, id, dto);
  }
}
