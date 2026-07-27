import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardDocumentsService } from './dashboard-documents.service';
import { VerifyOfferLetterDto } from '../dto/offer-letter-verify.dto';
import { DocumentVaultQueryDto } from '../dto/document-vault-query.dto';
import {
  CreateGeneratedAgreementDto,
  ForwardGeneratedAgreementDto,
  GeneratedAgreementQueryDto,
} from '../dto/generated-agreement.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../../common/enums';
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
  @ApiOperation({
    summary:
      'List generated legal documents (paginated) — Loan Agreement, Guarantee Deed, Hypothecation, Promissory Note. Pass applicationId to scope to a single application (used by the Credit Manager Legal Documents list and detail views).',
  })
  listAgreements(@Query() query: GeneratedAgreementQueryDto) {
    return this.dashboardDocumentsService.listAgreements(query);
  }

  @Post('agreements')
  @ApiOperation({
    summary:
      'Generate a legal document draft. Student/college/loan/EMI/guarantor fields are auto-populated from the application and its Credit-Manager-configured loan account — only `remarks` (additional clauses/conditions) is user-supplied. Calling again for the same application/type creates a new draft (used for regeneration).',
  })
  createAgreement(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateGeneratedAgreementDto,
  ) {
    return this.dashboardDocumentsService.createAgreement(user.sub, dto);
  }

  @Post('agreements/:id/send-to-sign')
  @ApiOperation({
    summary: 'Send a draft legal document to the borrower to sign',
  })
  sendToSign(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.dashboardDocumentsService.sendToSign(user.sub, id);
  }

  @Patch('agreements/:id/mark-signed')
  @ApiOperation({
    summary:
      'Mark a legal document as signed. A SIGNED (or ACTIVE) Loan Agreement is required before disbursement can be confirmed.',
  })
  markSigned(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.dashboardDocumentsService.markSigned(user.sub, id);
  }

  @Post('agreements/:id/forward')
  @Roles(UserRole.CREDIT_MANAGER, UserRole.ADMIN)
  @ApiOperation({
    summary:
      "Forward a legal document to another staff role's queue (e.g. Initiator) so they can get it physically signed and upload the signed scan.",
  })
  forwardAgreement(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ForwardGeneratedAgreementDto,
  ) {
    return this.dashboardDocumentsService.forwardAgreement(user.sub, id, dto);
  }

  @Post('agreements/:id/upload-signed')
  @Roles(
    UserRole.INITIATOR,
    UserRole.SUPPORTER,
    UserRole.APPROVER,
    UserRole.CREDIT_MANAGER,
    UserRole.ADMIN,
  )
  @ApiOperation({
    summary:
      'Upload a scanned/photographed copy of the physically-signed legal document. Marks the document SIGNED.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'image/jpeg, image/png, image/webp, or application/pdf',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadSignedDocument(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.dashboardDocumentsService.uploadSignedDocument(
      user.sub,
      id,
      file,
    );
  }
}
