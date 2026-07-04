import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { DashboardAuditService } from './dashboard-audit.service';
import { AuditQueryDto } from '../dto/audit-query.dto';
import { ManualAuditEntryDto } from '../dto/manual-audit-entry.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { DASHBOARD_STAFF_ROLES } from '../dashboard-roles.constant';

@ApiTags('Dashboard: Audit Ledger')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...DASHBOARD_STAFF_ROLES)
@Controller('dashboard/audit')
export class DashboardAuditController {
  constructor(private readonly dashboardAuditService: DashboardAuditService) {}

  @Get()
  @ApiOperation({
    summary:
      'List audit log entries (paginated), filterable by category/user/application/date',
  })
  list(@Query() query: AuditQueryDto) {
    return this.dashboardAuditService.list(query);
  }

  @Post('manual-entry')
  @ApiOperation({ summary: 'Create a manual audit ledger entry' })
  manualEntry(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ManualAuditEntryDto,
  ) {
    return this.dashboardAuditService.manualEntry(user.sub, dto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export filtered audit log entries as CSV' })
  @ApiProduces('text/csv')
  async exportCsv(@Query() query: AuditQueryDto, @Res() res: Response) {
    const csv = await this.dashboardAuditService.exportCsv(query);
    const filename = `audit-log-${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}
