import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiProduces,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { AdminQueryDto } from './dto/admin-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('applications')
  @ApiOperation({
    summary: 'List all submitted applications with search & filters',
  })
  listApplications(@Query() query: AdminQueryDto) {
    return this.adminService.listApplications(query);
  }

  @Get('applications/:id')
  @ApiOperation({ summary: 'Get full application detail' })
  getDetail(@Param('id') id: string) {
    return this.adminService.getApplicationDetail(id);
  }

  @Get('applications/export/csv')
  @ApiOperation({ summary: 'Export filtered applications as CSV' })
  @ApiProduces('text/csv')
  async exportCsv(@Query() query: AdminQueryDto, @Res() res: Response) {
    const csv = await this.adminService.exportCsv(query);
    const filename = `applications-${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}
