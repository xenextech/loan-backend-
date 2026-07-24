import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DocumentVaultService } from './document-vault.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums';
import { DASHBOARD_STAFF_ROLES } from '../dashboard/dashboard-roles.constant';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';
import { RequireMenuKey } from '../permissions/decorators/require-menu-key.decorator';

// Reference implementation of the RBAC PermissionsGuard: RolesGuard still
// gates coarse role membership (unchanged), PermissionsGuard adds the
// Admin-configurable, DB-driven layer on top via the "document-vault" menu
// key — hiding this item in the Sidebar Access admin UI also blocks direct
// URL access here, satisfying "hiding the menu isn't enough" without
// touching every other dashboard controller.
@ApiTags('Document Vault')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.STUDENT, ...DASHBOARD_STAFF_ROLES)
@RequireMenuKey('document-vault')
@Controller('documents/vault')
export class DocumentVaultController {
  constructor(private readonly documentVaultService: DocumentVaultService) {}

  @Get()
  @ApiOperation({
    summary:
      "List college-generated documents (offer letters, agreements, enrollment certificates) linked to the caller's loan application(s). Students are always scoped to their own applications; bank staff must pass applicationId.",
  })
  @ApiQuery({
    name: 'applicationId',
    required: false,
    description:
      'Required for bank staff (scopes to one application). Optional for students — narrows to one of their own applications if provided.',
  })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('applicationId') applicationId?: string,
  ) {
    return this.documentVaultService.getVaultDocuments(
      user.sub,
      user.role,
      applicationId,
    );
  }

  @Get(':documentType/:id')
  @ApiOperation({
    summary: 'Get one vault document record for viewing',
  })
  @ApiParam({
    name: 'documentType',
    enum: ['offer-letter', 'agreement', 'enrollment-certificate'],
  })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  findOne(
    @Param('documentType') documentType: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentVaultService.getVaultDocument(
      documentType,
      id,
      user.sub,
      user.role,
    );
  }
}
