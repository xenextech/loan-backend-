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
import { DashboardDocumentsService } from './dashboard-documents.service';
import { VerifyOfferLetterDto } from '../dto/offer-letter-verify.dto';
import { DocumentVaultQueryDto } from '../dto/document-vault-query.dto';
import {
  CreateGeneratedAgreementDto,
  GeneratedAgreementQueryDto,
} from '../dto/generated-agreement.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { DASHBOARD_STAFF_ROLES } from '../dashboard-roles.constant';

@ApiTags('Dashboard: Document Center')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...DASHBOARD_STAFF_ROLES)
@Controller('dashboard/documents')
export class DashboardDocumentsController {
  constructor(
    private readonly dashboardDocumentsService: DashboardDocumentsService,
  ) {}

  @Post('offer-letter/verify')
  @ApiOperation({
    summary: 'Verify a borrower offer letter by ref no. or QR token',
  })
  verifyOfferLetter(
    @CurrentUser() user: JwtPayload,
    @Body() dto: VerifyOfferLetterDto,
  ) {
    return this.dashboardDocumentsService.verifyOfferLetter(user.sub, dto);
  }

  @Get('vault')
  @ApiOperation({
    summary: 'Cross-application document vault (paginated)',
  })
  getVault(@Query() query: DocumentVaultQueryDto) {
    return this.dashboardDocumentsService.getVault(query);
  }

  @Get('agreements')
  @ApiOperation({ summary: 'List generated agreements (paginated)' })
  listAgreements(@Query() query: GeneratedAgreementQueryDto) {
    return this.dashboardDocumentsService.listAgreements(query);
  }

  @Post('agreements')
  @ApiOperation({
    summary:
      'Generate an agreement draft, auto-populated from the loan application',
  })
  createAgreement(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateGeneratedAgreementDto,
  ) {
    return this.dashboardDocumentsService.createAgreement(user.sub, dto);
  }

  @Post('agreements/:id/send-to-sign')
  @ApiOperation({ summary: 'Send a draft agreement to the borrower to sign' })
  sendToSign(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.dashboardDocumentsService.sendToSign(user.sub, id);
  }

  @Patch('agreements/:id/mark-signed')
  @ApiOperation({ summary: 'Mark an agreement as signed' })
  markSigned(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.dashboardDocumentsService.markSigned(user.sub, id);
  }
}
