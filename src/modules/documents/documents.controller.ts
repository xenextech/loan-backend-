import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseEnumPipe,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DocumentType, IdentityType, UserRole } from '../../common/enums';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Documents')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications/:applicationId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post(':documentType')
  @Roles(UserRole.STUDENT, UserRole.INITIATOR)
  @ApiOperation({
    summary: 'Upload a document for an application',
    description:
      'Accepts JPG, JPEG, PNG, WEBP images or a PDF file (application/pdf). ' +
      'For identity documents: IDENTITY_FRONT and IDENTITY_BACK accept images or PDF. ' +
      'IDENTITY_DOCUMENT accepts image or PDF and can be used for any identity type. ' +
      'All three slots (IDENTITY_FRONT, IDENTITY_BACK, IDENTITY_DOCUMENT) can be used ' +
      'simultaneously — uploading both images and a PDF is supported for all identity types. ' +
      'For those three slots, pass ?identityType=<CITIZENSHIP|PASSPORT|DRIVING_LICENSE|' +
      'NATIONAL_ID|PAN_NUMBER> so each identity type keeps its own independent set of ' +
      'documents within the same application — omit it only for the generic ' +
      '"upload a document" option with no specific identity type. ' +
      'Initiators may only upload to INITIATOR-sourced applications they created.',
  })
  @ApiParam({ name: 'documentType', enum: DocumentType })
  @ApiQuery({
    name: 'identityType',
    enum: IdentityType,
    required: false,
    description:
      'Required (in practice) for IDENTITY_FRONT/IDENTITY_BACK/IDENTITY_DOCUMENT ' +
      "to keep each identity type's documents independent; omitted for every other documentType.",
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'image/jpeg, image/png, image/jpg, image/webp, or application/pdf',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadDocument(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Param('documentType', new ParseEnumPipe(DocumentType))
    documentType: DocumentType,
    @Query('identityType') identityType: string | undefined,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.documentsService.uploadDocument(
      applicationId,
      user.sub,
      user.role,
      documentType,
      identityType,
      file,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List documents for an application',
    description:
      'Optionally filter to a single identity type via ?identityType=... — ' +
      'omit it to get every document on the application (the client is then ' +
      'responsible for its own documentType/identityType matching, as the ' +
      'apply wizard does).',
  })
  @ApiQuery({ name: 'identityType', enum: IdentityType, required: false })
  getDocuments(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Query('identityType') identityType?: string,
  ) {
    return this.documentsService.getDocuments(
      applicationId,
      user.sub,
      user.role,
      identityType,
    );
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT, UserRole.INITIATOR)
  @ApiOperation({ summary: 'Delete a document' })
  deleteDocument(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.documentsService.deleteDocument(
      applicationId,
      documentId,
      user.sub,
      user.role,
    );
  }
}
